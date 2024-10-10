import { ponder } from "@/generated";
import { formatEther } from "viem";

ponder.on("CalculateLPReward:block", async ({ event, context }) => {
  console.log("CalculateLPReward:block", event.block.number);

  const { Staking, DyadXP, DNft } = context.contracts;
  const { TotalLiquidity, Liquidity } = context.db;

  const client = context.client;

  const results = await client.multicall({
    contracts: [
      {
        abi: Staking.abi,
        address: Staking.address,
        functionName: "totalLP",
      },
      {
        abi: DyadXP.abi,
        address: DyadXP.address,
        functionName: "totalSupply",
      },
      {
        abi: DNft.abi,
        address: DNft.address,
        functionName: "totalSupply",
      },
    ],
    allowFailure: false,
  });

  const [totalLiquidity, totalXp, totalNft] = results;

  await TotalLiquidity.upsert({
    id: event.block.number,
    create: {
      totalLiquidity,
      totalXp,
      timestamp: event.block.timestamp,
    },
    update: {
      totalLiquidity,
      totalXp,
      timestamp: event.block.timestamp,
    }
  });

  const depositedCalls = Array.from({ length: Number(totalNft) }).map((_, i) => ({
    abi: Staking.abi,
    address: Staking.address,
    functionName: "noteIdToAmountDeposited",
    args: [BigInt(i)],
  }));

  const xpCalls = Array.from({ length: Number(totalNft) }).map((_, i) => ({
    abi: DyadXP.abi,
    address: DyadXP.address,
    functionName: "balanceOfNote",
    args: [BigInt(i)],
  }));

  const depositedResults = await client.multicall({
    contracts: depositedCalls,
    allowFailure: false,
  });

  const xpResults = await client.multicall({
    contracts: xpCalls,
    allowFailure: false,
  });

  const promises = depositedResults.map((result, i) => {
    const [deposited] = result;
    const noteId = BigInt(i);

    return Liquidity.upsert({
      id: event.block.number,
      create: {
        noteId,
        liquidity: deposited,
        liquidityPercentage: format(deposited) / format(totalLiquidity),
        xp: xpResults[i] as bigint,
        xpPercentage: format(xpResults[i] as bigint) / format(totalXp),
        timestamp: event.block.timestamp,
      },
    });
  });

  await Promise.all(promises);

});


function format(value: bigint) {
    return Number(formatEther(value))
}