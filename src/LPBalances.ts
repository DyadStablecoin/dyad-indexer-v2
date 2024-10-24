import { ponder } from "@/generated";
import { Address, encodeAbiParameters, keccak256 } from "viem";
import config from "../ponder.config";

ponder.on("LPStakingFactory:PoolStakingCreated", async ({ event, context }) => {
  console.log("LPStakingFactory:PoolStakingCreated", event.args.staking);

  const { Pool } = context.db;

  await Pool.create({
    id: event.args.staking,
    data: {
      lpToken: event.args.lpToken,
    }
  });
});

ponder.on("IndexLPBalances:block", async ({ event, context }) => {
  console.log("IndexLPBalances:block", event.block.number);

  const { NoteLiquidity, Liquidity, Pool } = context.db;

  const pools = await Pool.findMany();

  const client = context.client;

  for (const pool of pools.items) {
    const results = await client.multicall({
      contracts: [
        {
          abi: config.contracts.Staking.abi,
          address: pool.id as Address,
          functionName: "totalLP",
        },
        {
          abi: config.contracts.DyadXP.abi,
          address: config.contracts.DyadXP.address,
          functionName: "totalSupply",
        },
        {
          abi: config.contracts.DNft.abi,
          address: config.contracts.DNft.address,
          functionName: "totalSupply",
        }
      ],
      allowFailure: false,
    });

    const [
      totalLiquidity,
      totalXp,
      totalNft,
    ] = results;

    const depositedCalls = Array.from({ length: Number(totalNft) }).map((_, i) => ({
      abi: config.contracts.Staking.abi,
      address: pool.id as Address,
      functionName: "noteIdToAmountDeposited",
      args: [BigInt(i)],
    }));

    const xpCalls = Array.from({ length: Number(totalNft) }).map((_, i) => ({
      abi: config.contracts.DyadXP.abi,
      address: config.contracts.DyadXP.address,
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

    const liquidityId = keccak256(encodeAbiParameters([
      { type: "address" },
      { type: "uint256" },
    ], [pool.id as Address, event.block.number]));

    await Liquidity.upsert({
      id: liquidityId,
      create: {
        blockNumber: event.block.number,
        pool: pool.id,
        totalLiquidity,
        totalXp,
        timestamp: event.block.timestamp,
      },
      update: {
        blockNumber: event.block.number,
        pool: pool.id,
        totalLiquidity,
        totalXp,
        timestamp: event.block.timestamp,
      },
    });

    const noteLiquidity = depositedResults.map((result, i) => {
      const liquidity = result as bigint;
      const noteId = BigInt(i);
      const xp = xpResults[i] as bigint;
      const recordId = keccak256(encodeAbiParameters([
        { type: "uint256" },
        { type: "uint256" },
        { type: "address" }
      ], [noteId, event.block.number, pool.id as Address]));

      return NoteLiquidity.upsert({
        id: recordId,
        create: {
          noteId,
          liquidity,
          xp,
          timestamp: event.block.timestamp,
          blockNumber: event.block.number,
          pool: pool.id,
          liquidityId,
        },
        update: {
          noteId,
          liquidity,
          xp,
          timestamp: event.block.timestamp,
          blockNumber: event.block.number,
          pool: pool.id,
          liquidityId,
        },
      })
    })

    await Promise.all(noteLiquidity);
  }
});