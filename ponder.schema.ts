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

  NoteLiquidity: p.createTable({
    id: p.string(),
    pool: p.string(),
    noteId: p.bigint(),
    blockNumber: p.bigint().references("Liquidity.id"),
    liquidity: p.bigint(),
    xp: p.bigint(),
    timestamp: p.bigint(),
  }),

  Liquidity: p.createTable({
    id: p.bigint(),
    totalLiquidity: p.bigint(),
    totalXp: p.bigint(),
    timestamp: p.bigint(),
    notes: p.many("NoteLiquidity.blockNumber")
  })
}));
