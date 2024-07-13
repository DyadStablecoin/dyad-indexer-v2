import { ponder } from "@/generated";
import { VaultManagerAbi } from "../abis/VaultManagerAbi";
import { VaultAbi } from "../abis/VaultAbi";

async function getCr(context, id) {
  return await context.client.readContract({
    abi: VaultManagerAbi,
    address: "0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7",
    functionName: "collatRatio",
    args: [id],
  });
}

async function getKerosene(context, id) {
  return await context.client.readContract({
    abi: VaultAbi,
    address: "0x4808e4CC6a2Ba764778A0351E1Be198494aF0b43",
    functionName: "id2asset",
    args: [id],
  });
}

async function updateNote(event, context) {
  const { Note } = context.db;
  const cr = await getCr(context, event.args.id);
  const kerosene = await getKerosene(context, event.args.id);
  await Note.upsert({
    id: event.args.id,
    create: {
      collatRatio: cr,
      kerosene: kerosene ?? 0,
    },
  });
}

// ponder.on("VaultManagerV4:Added", async ({ event, context }) => {
//   updateNote(event, context);
// });

ponder.on("VaultManagerV4:MintDyad", async ({ event, context }) => {
  updateNote(event, context);
});

ponder.on("VaultManagerV4:BurnDyad", async ({ event, context }) => {
  updateNote(event, context);
});
