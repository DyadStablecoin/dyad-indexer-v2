import { formatEther, parseEther, parseUnits } from 'viem';
import { assert, describe, expect, it, vi } from 'vitest';

import { computeRewardsForPeriod } from '../src/ComputeRewards';

describe('Reward Calculation', () => {
  it('should calculate the reward correctly', async () => {
    console.log('Starting test');

    vi.mock('@/generated');

    const mockDbProcedures = {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
    };

    const mockContext = {
      db: {
        Liquidity: {
          ...mockDbProcedures,
          findMany: vi.fn().mockResolvedValue({
            items: [{}],
            pageInfo: { hasNextPage: false },
          }),
        },
        NoteLiquidity: {
          ...mockDbProcedures,
          findMany: vi.fn().mockResolvedValue({
            items: [
              {
                noteId: 1,
                xp: parseUnits('2500', 27),
                liquidity: parseUnits('1000000', 18),
              },
              {
                noteId: 2,
                xp: parseUnits('40000', 27),
                liquidity: parseUnits('10000', 18),
              },
              {
                noteId: 3,
                xp: parseUnits('10000', 27),
                liquidity: parseUnits('80000', 18),
              },
              {
                noteId: 4,
                xp: parseUnits('0', 27),
                liquidity: parseUnits('1000000', 18),
              },
              {
                noteId: 5,
                xp: parseUnits('100000', 27),
                liquidity: parseUnits('10000', 18),
              },
            ],
            pageInfo: { hasNextPage: false },
          }),
        },
      },
    };

    const result = await computeRewardsForPeriod(
      parseEther('1'),
      '0x0000000000000000000000000000000000000000',
      BigInt(0),
      BigInt(100),
      mockContext.db,
    );

    const totalRewards = Number(
      formatEther(Object.values(result).reduce((acc, curr) => acc + curr, 0n)),
    );

    const noteRewards = Object.entries(result).reduce(
      (acc, [noteId, reward]) => {
        acc[noteId] = Number(formatEther(reward));
        return acc;
      },
      {} as Record<string, number>,
    );

    if (
      noteRewards[1] === undefined ||
      noteRewards[2] === undefined ||
      noteRewards[3] === undefined ||
      noteRewards[4] === undefined ||
      noteRewards[5] === undefined
    ) {
      assert.fail('Note rewards are undefined');
    }

    expect(noteRewards[1] / totalRewards).toBeCloseTo(0.2220735, 7);
    expect(noteRewards[2] / totalRewards).toBeCloseTo(0.1388566, 7);
    expect(noteRewards[3] / totalRewards).toBeCloseTo(0.380726, 7);
    expect(noteRewards[4] / totalRewards).toBeCloseTo(0.0997294, 7);
    expect(noteRewards[5] / totalRewards).toBeCloseTo(0.1586145, 7);
  });
});
