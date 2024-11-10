import { ponder } from '@/generated';

import { REWARDS } from '../generated/rewardsSnapshot';
import { handleComputeRewards } from './ComputeRewards';

ponder.on('LPStakingFactory:setup', async ({ context }) => {
  const { TotalReward } = context.db;

  await TotalReward.createMany({
    data: REWARDS.map((reward) => ({
      id: BigInt(reward.id),
      amount: BigInt(reward.amount),
      lastUpdated: BigInt(reward.lastUpdated),
    })),
  });
});
ponder.on('ComputeRewards:block', handleComputeRewards);
