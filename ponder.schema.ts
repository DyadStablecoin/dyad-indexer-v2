import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Note: p.createTable({
    id: p.bigint(),
    collatRatio: p.bigint().optional(),
    kerosene: p.bigint().optional(),
    dyad: p.bigint().optional(),
    xp: p.bigint().optional(),
    collateral: p.bigint().optional(),
  }),
}));
