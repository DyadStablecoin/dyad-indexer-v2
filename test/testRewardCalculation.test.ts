import { formatEther, parseEther, parseUnits, zeroAddress } from "viem";
import { describe, expect, it,vi } from "vitest";

import { computeRewardsForPeriod } from "../src/ComputeRewards";

describe('Reward Calculation', () => {
    it('should calculate the reward correctly', async () => {
        console.log("Starting test");
        const mockContext = {
            db: {
                Liquidity: {
                    findMany: vi.fn().mockResolvedValue({ items: [{}], pageInfo: { hasNextPage: false } })
                },
                NoteLiquidity: {
                    findMany: vi.fn().mockResolvedValue({
                        items: [
                            {
                                noteId: 1,
                                xp: parseUnits("1000", 27),
                                liquidity: parseUnits("1000000", 18)
                            },
                            {
                                noteId: 2,
                                xp: parseUnits("40000", 27),
                                liquidity: parseUnits("10000", 18)
                            },
                            {
                                noteId: 3,
                                xp: parseUnits("10000", 27),
                                liquidity: parseUnits("100000", 18)
                            },
                            {
                                noteId: 4,
                                xp: parseUnits("1000", 27),
                                liquidity: parseUnits("1000000", 18)
                            },
                            {
                                noteId: 5,
                                xp: parseUnits("100000", 27),
                                liquidity: parseUnits("100", 18)
                            },
                        ], pageInfo: { hasNextPage: false }
                    })
                }
            }
        } as any;

        const result = await computeRewardsForPeriod(parseEther("1"), "0x0000000000000000000000000000000000000000", BigInt(0), BigInt(100), mockContext);

        const totalRewards = Number(formatEther(Object.values(result).reduce((acc, curr) => acc + curr, 0n)));

        const noteRewards = Object.entries(result).reduce((acc, [noteId, reward]) => {
            acc[noteId] = Number(formatEther(reward));
            return acc;
        }, {} as Record<string, number>);

        expect(noteRewards[1]! / totalRewards).toBeCloseTo(0.2029110, 7);
        expect(noteRewards[2]! / totalRewards).toBeCloseTo(0.1287961, 7);
        expect(noteRewards[3]! / totalRewards).toBeCloseTo(0.4638979, 7);
        expect(noteRewards[4]! / totalRewards).toBeCloseTo(0.2029110, 7);
        expect(noteRewards[5]! / totalRewards).toBeCloseTo(0.0014839, 7);
    });
});