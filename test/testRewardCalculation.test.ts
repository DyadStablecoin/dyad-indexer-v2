import { formatEther, parseEther, parseUnits, zeroAddress } from "viem";
import { computeRewardsForPeriod } from "../src/ComputeRewards";
import { beforeEach, describe, expect, test, vi, it } from "vitest";

describe('Reward Calculation', () => {
    it('should calculate the reward correctly', async () => {
        console.log("Starting test");
        const pool = zeroAddress;
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

        const totalRewards = Object.values(result).reduce((acc, curr) => acc + curr, 0n);
        console.log("Total rewards", formatEther(totalRewards));
        console.log("Note 1 rewards", formatEther(result[1]!))
        console.log("Note 2 rewards", formatEther(result[2]!));
        console.log("Note 3 rewards", formatEther(result[3]!));
        console.log("Note 4 rewards", formatEther(result[4]!));
        console.log("Note 5 rewards", formatEther(result[5]!));
    });
});