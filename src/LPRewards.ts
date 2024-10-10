import { ponder } from "@/generated";
import { encodeAbiParameters, keccak256, zeroAddress } from "viem";
import config from "../ponder.config";

ponder.on("CalculateLPReward:block", async ({ event, context }) => {
  console.log("CalculateLPReward:block", event.block.number);

//  console.log('context', JSON.stringify(context, null, 2));

  const { NoteLiquidity, Liquidity } = context.db;


  const client = context.client;

  const results = await client.multicall({
    contracts: [
      // {
      //   abi: Staking.abi,
      //   address: Staking.address,
      //   functionName: "totalLP",
      // },
      {
        abi: config.contracts.DyadXP.abi,
        address: config.contracts.DyadXP.address,
        functionName: "totalSupply",
      },
      {
        abi: config.contracts.DNft.abi,
        address: config.contracts.DNft.address,
        functionName: "totalSupply",
      },
      // {
      //   abi: Staking.abi,
      //   address: Staking.address,
      //   functionName: "lpToken",
      // },
    ],
    allowFailure: false,
  });

  const totalLiquidity = 0n;
  const lpToken = zeroAddress;

  const [
    //totalLiquidity, 
    totalXp, 
    totalNft, 
    //lpToken
  ] = results;

  const depositedCalls = Array.from({ length: Number(totalNft) }).map((_, i) => ({
    abi: config.contracts.Staking.abi,
    address: config.contracts.Staking.address,
    functionName: "noteIdToAmountDeposited",
    args: [BigInt(i)],
  }));

  const xpCalls = Array.from({ length: Number(totalNft) }).map((_, i) => ({
    abi: config.contracts.DyadXP.abi,
    address: config.contracts.DyadXP.address,
    functionName: "balanceOfNote",
    args: [BigInt(i)],
  }));

  const depositedResults = Array.from({ length: Number(totalNft) }).map((_, i) => 0n);
  // const depositedResults = await client.multicall({
  //   contracts: depositedCalls,
  //   allowFailure: false,
  // });

  const xpResults = await client.multicall({
    contracts: xpCalls,
    allowFailure: false,
  });

  await Liquidity.upsert({
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
      ], [noteId, event.block.number, lpToken]));
  
      return NoteLiquidity.upsert({
        id: recordId,
        create: {
          noteId,
          liquidity,
          xp,
          timestamp: event.block.timestamp,
          blockNumber: event.block.number,
          pool: lpToken,
        },
        update: {
          noteId,
          liquidity,
          xp,
          timestamp: event.block.timestamp,
          blockNumber: event.block.number,
          pool: lpToken,
        },
      })
    })

  await Promise.all(noteLiquidity);
});