import { ponder } from "@/generated";
import { handleComputeRewards } from "./ComputeRewards";
import { REWARDS } from "../generated/rewardsSnapshot";

ponder.on("LPStakingFactory:setup", async ({ context }) => {
    const { TotalReward } = context.db;

    await TotalReward.createMany({
        data: REWARDS.map((reward) => ({
            id: BigInt(reward.id),
            amount: BigInt(reward.amount),
            lastUpdated: BigInt(reward.lastUpdated)
        }))
    })
});
ponder.on("ComputeRewards:block", handleComputeRewards);
