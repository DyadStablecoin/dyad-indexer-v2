import { ponder } from "@/generated";
import { handleComputeRewards } from "./ComputeRewards";
import { initializeSnapshotData } from "./LPBalances";
import { handleLiquidate } from "./liquidation";

ponder.on("LPStakingFactory:setup", initializeSnapshotData);
ponder.on("ComputeRewards:block", handleComputeRewards);
ponder.on("VaultManagerV4:Liquidate", handleLiquidate);