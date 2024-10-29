import { ponder } from "@/generated";
import { desc, eq, graphql } from "@ponder/core";
import { buildMerkleTree, getLeaf } from "../buildMerkleTree";
import { createPublicClient, formatUnits, getAddress, parseEther } from "viem";
import { mainnet } from "viem/chains";
import ponderConfig from "../../ponder.config";
import { LP_TANH_FACTOR, XP_TANH_FACTOR } from "../constants";
import { HTTPException } from "hono/http-exception";
 
ponder.use("/", graphql());
ponder.use("/graphql", graphql());
ponder.get("/api/rewards/:id", async (context) => {
  const id = context.req.param("id");

  const noteRewards = await context.db.select()
    .from(context.tables.TotalReward)
    .where(eq(context.tables.TotalReward.id, BigInt(id)));

  const allRewards = await context.db.select()
    .from(context.tables.TotalReward);

  const tree = buildMerkleTree(allRewards);
  const root = tree.getHexRoot();

  if (noteRewards.length === 0) {
    return context.json({
      amount: "0",
      //leaf: "0x",
      proof: [],
      root
    });
  }

  const leaf = getLeaf(noteRewards[0]!);
  const proof = tree.getHexProof(leaf);

  return context.json({
    amount: noteRewards[0]!.amount.toString(),
    //leaf,
    proof,
    root    
  });
});
ponder.get("/api/yield", async (context) => {
  const { pool: reqToken, noteId: reqNoteId } = context.req.query();

  if (!reqNoteId) {
    throw new HTTPException(400, {message: "Missing noteId" });
  }

  if (!reqToken) {
    throw new HTTPException(400, {message: "Missing token" });
  }

  const noteId = BigInt(reqNoteId);

  const lpToken = getAddress(reqToken);
  const pool = await context.db.select()
    .from(context.tables.Pool)
    .where(eq(context.tables.Pool.lpToken, lpToken))
    .limit(1);

  if (pool.length === 0) {
    throw new HTTPException(400, {message: "Pool not found" });
  }

  const liquidity = await context.db.select()
    .from(context.tables.Liquidity)
    .where(eq(context.tables.Liquidity.pool, pool[0]!.id))
    .orderBy(desc(context.tables.Liquidity.timestamp))
    .limit(1);

  const noteLiquidities = await context.db.select()
    .from(context.tables.NoteLiquidity)
    .where(eq(context.tables.NoteLiquidity.liquidityId, liquidity[0]!.id));

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: ponderConfig.networks.mainnet.transport
  });

  const balances = await publicClient.multicall({
    contracts: [
      {
        address: pool[0]!.id as `0x${string}`,
        abi: ponderConfig.contracts.Staking.abi,
        functionName: "noteIdToAmountDeposited",
        args: [noteId]
      },
      {
        address: ponderConfig.contracts.DyadXP.address as `0x${string}`,
        abi: ponderConfig.contracts.DyadXP.abi,
        functionName: "balanceOfNote",
        args: [noteId]
      },
      {
        address: ponderConfig.contracts.LPStakingFactory.address as `0x${string}`,
        abi: ponderConfig.contracts.LPStakingFactory.abi,
        functionName: "lpTokenToRewardRate",
        args: [lpToken as `0x${string}`]
      }
    ],
    allowFailure: false
  });

  let [amountDeposited, xpAmount, rewardRate] = balances;

  console.log(amountDeposited, xpAmount, rewardRate);

  let totalLiquidity = amountDeposited;
  let totalXp = xpAmount;
  let totalParticipants = noteLiquidities.length + 1; // +1 for current note
  for (const noteLiquidity of noteLiquidities) {
    if (noteLiquidity.noteId === noteId) {
      // don't include current note in total participants
      // since the values are being used from current block
      totalParticipants--;
      continue;
    } else {
      totalLiquidity += noteLiquidity.liquidity;
      totalXp += noteLiquidity.xp;
    }
  }

  const totalXpScaled = Number(formatUnits(totalXp, 27)) / totalParticipants;
  const totalLiquidityScaled = Number(formatUnits(totalLiquidity, 18)) / totalParticipants;

  const noteBoostedSize = computeBoostedSize(xpAmount, amountDeposited, totalXpScaled, totalLiquidityScaled);
  let totalEffectiveSize = noteBoostedSize;

  for (const noteLiquidity of noteLiquidities) {
    if (noteLiquidity.noteId === noteId) {
      continue;
    }

    const boostedSize = computeBoostedSize(noteLiquidity.xp, noteLiquidity.liquidity, totalXpScaled, totalLiquidityScaled);
    totalEffectiveSize += boostedSize;
  }

  const rewardPerSecondWad = rewardRate * parseEther((noteBoostedSize / totalEffectiveSize).toString());

  const rewardPerYear = (rewardPerSecondWad * 31536000n) / BigInt(1e18); // 31536000 seconds in a year

  return context.json({
    totalLiquidity: formatUnits(totalLiquidity, 18),
    totalXp: formatUnits(totalXp, 27),
    noteLiquidity: formatUnits(amountDeposited, 18),
    noteXp: formatUnits(xpAmount, 27),
    rewardRate: formatUnits(rewardRate, 18),
    kerosenePerYear: formatUnits(rewardPerYear, 18),
  });
});

function computeBoostedSize(xp: bigint, liquidity: bigint, totalXpScaled: number, totalLiquidityScaled: number) {
  const scaledXp = Number(formatUnits(xp, 27));
    const scaledLiquidity = Number(formatUnits(liquidity, 18));

    const tanhXP = XP_TANH_FACTOR * Math.tanh(scaledXp / totalXpScaled)
    const tanhLP = LP_TANH_FACTOR * Math.tanh(scaledLiquidity / totalLiquidityScaled);

    const boostedSize = tanhXP * tanhLP;

    return boostedSize;
}