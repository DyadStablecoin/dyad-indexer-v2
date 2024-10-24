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
    id: p.string(), // keccak256(abi.encode(note.id, blockNumber, pool.id))
    liquidityId: p.string().references("Liquidity.id"),
    pool: p.string().references("Pool.id"),
    noteId: p.bigint(),
    blockNumber: p.bigint(),
    liquidity: p.bigint(),
    xp: p.bigint(),
    timestamp: p.bigint(),
  }),

  Liquidity: p.createTable({
    id: p.string(), // keccak256(abi.encode(pool.id, blockNumber))
    blockNumber: p.bigint(),
    pool: p.string().references("Pool.id"),
    totalLiquidity: p.bigint(),
    totalXp: p.bigint(),
    timestamp: p.bigint(),
    notes: p.many("NoteLiquidity.liquidityId")
  }),

  Pool: p.createTable({
    id: p.string(),
    lpToken: p.string(),
    liquidity: p.many("Liquidity.pool")
  }),
}));
