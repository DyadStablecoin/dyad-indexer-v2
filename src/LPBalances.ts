import { Address, encodeAbiParameters, keccak256 } from "viem";

import { ponder } from "@/generated";

import config from "../ponder.config";

ponder.on("LPStakingFactory:PoolStakingCreated", async ({ event, context }) => {
  console.log("LPStakingFactory:PoolStakingCreated", event.args.staking);

  const { Pool, RewardRate } = context.db;

  await Pool.create({
    id: event.args.staking,
    data: {
      lpToken: event.args.lpToken,
    }
  });

  await RewardRate.create({
    id: keccak256(encodeAbiParameters([
      { type: "address" },
      { type: "uint256" },
    ], [event.args.staking, event.block.number])),
    data: {
      pool: event.args.staking,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      rate: 0n
    }
  });
});

ponder.on("LPStakingFactory:RewardRateSet", async ({ event, context }) => {
  console.log("LPStakingFactory:RewardRateSet", event.args.lpToken, event.args.newRewardRate);

  const { RewardRate, Pool } = context.db;

  const pools = await Pool.findMany({
    limit: 1,
    where: {
      lpToken: event.args.lpToken,
    }
  });

  if (pools.items.length !== 1) {
    return;
  }

  await RewardRate.create({
    id: keccak256(encodeAbiParameters([
      { type: "address" },
      { type: "uint256" },
    ], [event.args.lpToken, event.block.number])),
    data: {
      pool: pools.items[0]!.id,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      rate: event.args.newRewardRate,
    }
  });
});

ponder.on("IndexLPBalances:block", async ({ event, context }) => {
  console.log("IndexLPBalances:block", event.block.number);

  const { NoteLiquidity, Liquidity, Pool, TotalReward } = context.db;

  // Check if the total reward has already been updated for a later block and skip if so
  const alreadyUpdated = await TotalReward.findMany({
    limit: 1,
    where: {
      lastUpdated: {
        gt: event.block.number,
      }
    }
  });

  if (alreadyUpdated.items.length > 0) {
    return;
  }

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

    const liquidityId = keccak256(encodeAbiParameters([
      { type: "address" },
      { type: "uint256" },
    ], [pool.id as Address, event.block.number]));

    if (totalLiquidity === 0n) {
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
      return;
    }

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
      if (liquidity === 0n) {
        return Promise.resolve();
      }
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