import { formatEther } from 'viem';

import { Context, ponder } from '@/generated';

import { DNftAbi } from '../abis/DNftAbi';
import { DyadAbi } from '../abis/DyadAbi';
import { VaultAbi } from '../abis/VaultAbi';
import { VaultManagerV4_0x2592Abi } from '../abis/VaultManagerV4_0x2592Abi';
import { XpABI } from '../abis/XpAbi';

ponder.on('GetXP:block', async ({ event, context }) => {
  console.log('GetXP:block', event.block.number);
  const totalSupply = await context.client.readContract({
    abi: DNftAbi,
    address: '0xDc400bBe0B8B79C07A962EA99a642F5819e3b712',
    functionName: 'totalSupply',
  });

  console.log(
    `Updating ${totalSupply} notes XP for block ${event.block.number}`,
  );
  const promises = [];
  for (let id = 0; id < totalSupply; id++) {
    promises.push(updateNote(context, BigInt(id)));
  }
  const allExoCollateral: bigint[] = await Promise.all(promises);

  const totalExoCollateral = allExoCollateral.reduce(
    (acc, val) => acc + val,
    BigInt(0),
  );

  console.log(
    `Done updating ${totalSupply} notes for block ${event.block.number}. ${formatEther(totalExoCollateral)} TVL.`,
  );

  const { Tvl } = context.db;
  await Tvl.upsert({
    id: event.block.number,
    create: {
      tvl: totalExoCollateral,
      timestamp: event.block.timestamp,
    },
    update: {
      timestamp: event.block.timestamp,
      tvl: totalExoCollateral,
    },
  });
});

ponder.on('VaultManagerV4:Liquidate', async ({ event, context }) => {
  const { Note } = context.db;
  await Note.upsert({
    id: BigInt(event.args.id),
    create: {
      lastLiquidation: event.block.timestamp,
    },
    update: {
      lastLiquidation: event.block.timestamp,
    },
  });
});

async function updateNote(context: Context, id: bigint) {
  const results = await context.client.multicall({
    contracts: [
      {
        abi: VaultManagerV4_0x2592Abi,
        address: '0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7',
        functionName: 'collatRatio',
        args: [id],
      },
      {
        abi: VaultAbi,
        address: '0x4808e4CC6a2Ba764778A0351E1Be198494aF0b43',
        functionName: 'id2asset',
        args: [id],
      },
      {
        abi: DyadAbi,
        address: '0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab',
        functionName: 'mintedDyad',
        args: [id],
      },
      {
        abi: XpABI,
        address: '0xeF443646E52d1C28bd757F570D18F4Db30dB70F4',
        functionName: 'balanceOfNote',
        args: [id],
      },
      {
        abi: VaultManagerV4_0x2592Abi,
        address: '0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7',
        functionName: 'getVaultsValues',
        args: [id],
      },
    ],
  });

  const collatRatio = results[0].result;
  const kerosene = results[1].result;
  const dyad = results[2].result;
  const xp = results[3].result;

  let exoCollateral = BigInt(0);
  let collateral = BigInt(0);

  if (results[4].status === 'success') {
    exoCollateral = BigInt(results[4].result[0]);
    collateral = exoCollateral + BigInt(results[4].result[1]);
  }

  const { Note } = context.db;
  await Note.upsert({
    id: BigInt(id),
    create: {
      collatRatio: collatRatio,
      kerosene: kerosene,
      dyad: dyad,
      xp: xp,
      collateral: collateral,
      exoCollateral,
    },
    update: {
      collatRatio: collatRatio,
      kerosene: kerosene,
      dyad: dyad,
      xp: xp,
      collateral: collateral,
      exoCollateral,
    },
  });

  // return the exo collateral value
  return exoCollateral;
}
