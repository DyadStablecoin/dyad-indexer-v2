import { ponder } from "@/generated";
import { handleComputeRewards } from "./ComputeRewards";

ponder.on("ComputeRewards:block", async ({ event, context }) =>
    handleComputeRewards({ event, context })
);