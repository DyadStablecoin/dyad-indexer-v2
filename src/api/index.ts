import { asc, desc, eq, graphql } from '@ponder/core';
import { HTTPException } from 'hono/http-exception';
import {
  createPublicClient,
  formatUnits,
  getAddress,
  parseEther,
  parseUnits,
} from 'viem';
import { mainnet } from 'viem/chains';

import { ApiContext, ponder, Schema } from '@/generated';

import ponderConfig from '../../ponder.config';
import { buildMerkleTree, getLeaf } from '../buildMerkleTree';
import { computeBoostedSize } from '../computeBoostedSize';
import { LP_TANH_FACTOR, XP_BASE_FACTOR, XP_TANH_FACTOR } from '../constants';
import { median } from '../utils';

interface YieldReturnType {
  lpToken: string;
  totalLiquidity: string;
  totalXp: string;
  medianLiquidity: number;
  averageXp: number;
  noteLiquidity: string;
  noteXp: string;
  rewardRate: string;
  effectiveSize: number;
  totalEffectiveSize: number;
  maxEffectiveSize: number;
  kerosenePerYear: string;
}

ponder.use('/', graphql());
ponder.use('/graphql', graphql());
ponder.get('/api/rewards/:id', async (context) => {
  const id = context.req.param('id');

  const noteRewards = await context.db
    .select()
    .from(context.tables.TotalReward)
    .where(eq(context.tables.TotalReward.id, BigInt(id)));

  const allRewards = await context.db
    .select()
    .from(context.tables.TotalReward)
    .orderBy(asc(context.tables.TotalReward.id));

  const tree = buildMerkleTree(allRewards);
  const root = tree.getHexRoot();

  if (noteRewards[0] === undefined) {
    return context.json({
      amount: '0',
      //leaf: "0x",
      proof: [],
      root,
    });
  }

  const leaf = getLeaf(noteRewards[0]);
  const proof = tree.getHexProof(leaf);

  return context.json({
    amount: noteRewards[0].amount.toString(),
    //leaf,
    proof,
    root,
  });
});
ponder.get('/api/yield', async (context) => {
  const { pool: reqToken, noteId: reqNoteId } = context.req.query();

  if (!reqNoteId) {
    throw new HTTPException(400, { message: 'Missing noteId' });
  }

  if (!reqToken) {
    throw new HTTPException(400, { message: 'Missing token' });
  }

  const noteId = BigInt(reqNoteId);

  const lpToken = getAddress(reqToken);
  const pool = await context.db
    .select()
    .from(context.tables.Pool)
    .where(eq(context.tables.Pool.lpToken, lpToken))
    .limit(1);

  if (pool[0] === undefined) {
    throw new HTTPException(400, { message: 'Pool not found' });
  }

  const result = await getYieldsForPool(pool[0], noteId, context);

  return context.json(result);
});
ponder.get('/api/yields/:id', async (context) => {
  const id = context.req.param('id');

  const simXp: undefined | string = context.req.query('xp');
  const simLiquidity: undefined | string = context.req.query('liquidity');

  const simParameters = {
    xp: simXp !== undefined ? Number(simXp) : undefined,
    liquidity: simLiquidity !== undefined ? Number(simLiquidity) : undefined,
  };

  if (simParameters.xp !== undefined && isNaN(simParameters.xp)) {
    throw new HTTPException(400, { message: 'Invalid xp simulation value' });
  }
  if (simParameters.liquidity !== undefined && isNaN(simParameters.liquidity)) {
    throw new HTTPException(400, {
      message: 'Invalid liquidity simulation value',
    });
  }

  const results: Record<string, YieldReturnType> = {};

  const noteId = BigInt(id);

  const pools = await context.db.select().from(context.tables.Pool);

  for (const pool of pools) {
    results[pool.id] = await getYieldsForPool(
      pool,
      noteId,
      context,
      simParameters,
    );
  }

  return context.json(results);
});

async function getYieldsForPool(
  pool: { id: string; lpToken: string },
  noteId: bigint,
  context: ApiContext,
  simParameters?: {
    xp?: number;
    liquidity?: number;
  },
) {
  const { xp: overrideXp, liquidity: overrideLiquidity } = simParameters ?? {};

  const liquidity = await context.db
    .select()
    .from(context.tables.Liquidity)
    .where(eq(context.tables.Liquidity.pool, pool.id))
    .orderBy(desc(context.tables.Liquidity.timestamp))
    .limit(1);

  let noteLiquidities: Schema['NoteLiquidity'][] = [];

  if (liquidity[0] !== undefined) {
    noteLiquidities = await context.db
      .select()
      .from(context.tables.NoteLiquidity)
      .where(eq(context.tables.NoteLiquidity.liquidityId, liquidity[0].id));
  }

  const publicClient = createPublicClient({
    chain: mainnet,
    transport: ponderConfig.networks.mainnet.transport,
  });

  const balances = await publicClient.multicall({
    contracts: [
      {
        address: pool.id as `0x${string}`,
        abi: ponderConfig.contracts.Staking.abi,
        functionName: 'noteIdToAmountDeposited',
        args: [noteId],
      },
      {
        address: ponderConfig.contracts.DyadXP.address as `0x${string}`,
        abi: ponderConfig.contracts.DyadXP.abi,
        functionName: 'balanceOfNote',
        args: [noteId],
      },
      {
        address: ponderConfig.contracts.LPStakingFactory
          .address as `0x${string}`,
        abi: ponderConfig.contracts.LPStakingFactory.abi,
        functionName: 'lpTokenToRewardRate',
        args: [pool.lpToken as `0x${string}`],
      },
    ],
    allowFailure: false,
  });

  const [amountDeposited, xpAmount, rewardRate] = balances;

  const liquidityToUse =
    overrideLiquidity !== undefined
      ? parseEther(overrideLiquidity.toString())
      : amountDeposited;
  const xpToUse =
    overrideXp !== undefined ? parseUnits(overrideXp.toString(), 27) : xpAmount;

  const lpSizes = [];
  let totalLiquidity = liquidityToUse;
  let totalXp = 0n;
  let totalParticipants = noteLiquidities.length;
  if (liquidityToUse > 0n) {
    lpSizes.push(liquidityToUse);
    totalXp += xpToUse;
    totalParticipants++; // +1 for current note
  }
  for (const noteLiquidity of noteLiquidities) {
    if (noteLiquidity.noteId === noteId) {
      // don't include current note in total participants
      // since the values are being used from current block
      totalParticipants--;
      continue;
    } else {
      lpSizes.push(noteLiquidity.liquidity);
      totalLiquidity += noteLiquidity.liquidity;
      totalXp += noteLiquidity.xp;
    }
  }

  const totalXpScaled =
    totalParticipants > 0
      ? Number(formatUnits(totalXp, 27)) / totalParticipants
      : 0;
  const medianLiquidityScaled = median(
    lpSizes.map((n) => Number(formatUnits(n, 18))),
  );

  const noteBoostedSize = computeBoostedSize(
    xpToUse,
    liquidityToUse,
    totalXpScaled,
    medianLiquidityScaled,
  );
  let totalEffectiveSize = noteBoostedSize;

  for (const noteLiquidity of noteLiquidities) {
    if (noteLiquidity.noteId === noteId) {
      continue;
    }

    const boostedSize = computeBoostedSize(
      noteLiquidity.xp,
      noteLiquidity.liquidity,
      totalXpScaled,
      medianLiquidityScaled,
    );
    totalEffectiveSize += boostedSize;
  }

  const rewardPerSecondWad =
    totalEffectiveSize > 0n
      ? rewardRate *
        parseEther((noteBoostedSize / totalEffectiveSize).toString())
      : 0n;

  const rewardPerYear = (rewardPerSecondWad * 31536000n) / BigInt(1e18); // 31536000 seconds in a year

  return {
    lpToken: pool.lpToken,
    totalLiquidity: formatUnits(totalLiquidity, 18),
    medianLiquidity: medianLiquidityScaled,
    averageXp: totalXpScaled,
    totalXp: formatUnits(totalXp, 27),
    noteLiquidity: formatUnits(liquidityToUse, 18),
    noteXp: formatUnits(xpToUse, 27),
    rewardRate: formatUnits(rewardRate, 18),
    effectiveSize: noteBoostedSize,
    totalEffectiveSize,
    maxEffectiveSize: LP_TANH_FACTOR * (XP_BASE_FACTOR + XP_TANH_FACTOR),
    kerosenePerYear: formatUnits(rewardPerYear, 18),
  };
}
