import { parseEther } from "viem";
import { computeRewardsForPeriod } from "../src/ComputeRewards";
import { beforeEach, describe, expect, test, vi } from "vitest";

test('Reward Calculation', () => {
    describe('it should calculate the reward correctly', async () => {
        

        const mockContext = {
            Liquidity: {
                findMany: vi.fn().mockResolvedValue({ items: [], pageInfo: { hasNextPage: false } })
            },
            NoteLiquidity: {
                findMany: vi.fn().mockResolvedValue({ items: [], pageInfo: { hasNextPage: false } })
            }
        } as any;

        const result = await computeRewardsForPeriod(parseEther("1"), "0x0000000000000000000000000000000000000000", BigInt(1), BigInt(100), mockContext);
        expect(result).toEqual({});
    });
});