import { ponder } from "@/generated";
import { VaultManagerAbi } from "../abis/VaultManagerAbi";
import { VaultAbi } from "../abis/VaultAbi";
import { DyadAbi } from "../abis/DyadAbi";
import { DNftAbi } from "../abis/DNftAbi";
import { ERC20ABI } from "../abis/ERC20Abi";
import { XpABI } from "../abis/XpAbi";

async function getCr(context, id) {
  return await context.client.readContract({
    abi: VaultManagerAbi,
    address: "0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7",
    functionName: "collatRatio",
    args: [id],
  });
}

async function getKerosene(context, id) {
  try {
    return await context.client.readContract({
      abi: VaultAbi,
      address: "0x4808e4CC6a2Ba764778A0351E1Be198494aF0b43",
      functionName: "id2asset",
      args: [id],
    });
  } catch (e) {
    return 0n;
  }
}

async function getDyad(context, id) {
  try {
    return await context.client.readContract({
      abi: DyadAbi,
      address: "0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab",
      functionName: "mintedDyad",
      args: [id],
    });
  } catch (e) {
    return 0n;
  }
}

async function getXP(context, id) {
  try {
    return await context.client.readContract({
      abi: XpABI,
      address: "0xeF443646E52d1C28bd757F570D18F4Db30dB70F4",
      functionName: "balanceOfNote",
      args: [id],
    });
  } catch (e) {
    return 0n;
  }
}

async function updateNote(event, context) {
  console.log("event", event);
  const { Note } = context.db;
  console.log("getting cr");
  const cr = await getCr(context, event.args.id);
  console.log("getting kerosene");
  const kerosene = await getKerosene(context, event.args.id);
  console.log("getting dyad");
  const dyad = await getDyad(context, event.args.id);
  console.log("getting XP");
  const xp = await getXP(context, event.args.id);
  console.log("upserting", event.args.id, cr, kerosene, dyad);
  await Note.upsert({
    id: event.args.id,
    create: {
      collatRatio: cr,
      kerosene: kerosene ?? 0,
      dyad: dyad,
      xp: xp,
    },
  });
}

ponder.on("VaultManagerV4:MintDyad", async ({ event, context }) => {
  console.log("Minted DYAD");
  updateNote(event, context);
});

ponder.on("VaultManagerV4:BurnDyad", async ({ event, context }) => {
  console.log("Burned DYAD");
  updateNote(event, context);
});

async function createNft(context, event) {
  const { Note } = context.db;
  await Note.create({
    id: event.args.id,
    data: {
      collatRatio: 0n,
      kerosene: 0n,
      dyad: 0n,
      xp: 0n,
    },
  });
}

ponder.on("DNft:MintedNft", async ({ event, context }) => {
  console.log("Minted Nft");
  createNft(context, event);
});

ponder.on("DNft:MintedInsiderNft", async ({ event, context }) => {
  console.log("Minted Insider Nft");
  createNft(context, event);
});
