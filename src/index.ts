import { ponder } from "@/generated";
import { handleComputeRewards } from "./ComputeRewards";

ponder.on("ComputeRewards:block", handleComputeRewards);