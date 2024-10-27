import { ponder } from "@/generated";
import { eq, graphql } from "@ponder/core";
import { Schema } from "@/generated";
import { buildMerkleTree, getLeaf } from "../buildMerkleTree";
 
ponder.use("/", graphql());
ponder.use("/graphql", graphql());
ponder.get("/api/rewards/:id", async (context) => {
  const id = context.req.param("id");

  const noteRewards = await context.db.select()
    .from(context.tables.TotalReward)
    .where(eq(context.tables.TotalReward.id, BigInt(id)));

  const allRewards = await context.db.select()
    .from(context.tables.TotalReward);

  const tree = buildMerkleTree(allRewards);
  const root = tree.getHexRoot();

  if (noteRewards.length === 0) {
    return context.json({
      amount: "0",
      proof: [],
      root
    });
  }

  const proof = tree.getHexProof(getLeaf(noteRewards[0]!));

  return context.json({
    amount: noteRewards[0]!.amount.toString(),
    proof,
    root    
  });
});
