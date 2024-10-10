import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Note: p.createTable({
    id: p.bigint(),
    collatRatio: p.bigint().optional(),
    kerosene: p.bigint().optional(),
    dyad: p.bigint().optional(),
    xp: p.bigint().optional(),
    collateral: p.bigint().optional(),
    lastLiquidation: p.bigint().optional(),
    exoCollateral: p.bigint().optional(),
  }),

  Tvl: p.createTable({
    id: p.bigint(),
    tvl: p.bigint(),
    timestamp: p.bigint(),
  }),

  TotalLiquidity: p.createTable({
    id: p.bigint(),
    totalLiquidity: p.bigint(),
    totalXp: p.bigint(),
    timestamp: p.bigint(),
  }),

  Liquidity: p.createTable({
    id: p.bigint(),
    noteId: p.bigint(),
    liquidity: p.bigint(),
    liquidityPercentage: p.float(),
    xp: p.bigint(),
    xpPercentage: p.float(),
    timestamp: p.bigint(),
  }),
}));
