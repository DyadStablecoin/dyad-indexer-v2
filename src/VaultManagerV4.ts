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
    // console.log("error", e);
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
    // console.log("error", e);
    return 0n;
  }
}

async function getXP(context, id, event) {
  // if (event.block.number < 20292276) {
  //   return 0n;
  // }
  try {
    return await context.client.readContract({
      abi: XpABI,
      address: "0xeF443646E52d1C28bd757F570D18F4Db30dB70F4",
      functionName: "balanceOfNote",
      args: [id],
    });
  } catch (e) {
    // console.log("error", e);
    return 0n;
  }
}

async function updateNote(event, context) {
  const { Note } = context.db;
  console.log("getting cr");
  const cr = await getCr(context, event.args.id);
  console.log("getting kerosene");
  const kerosene = await getKerosene(context, event.args.id);
  console.log("getting dyad");
  const dyad = await getDyad(context, event.args.id);
  console.log("getting XP");
  const xp = await getXP(context, event.args.id, event);
  console.log("updating", event.args.id, cr, kerosene, dyad, xp);
  await Note.update({
    id: event.args.id,
    data: {
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

ponder.on("VaultManagerV4:RedeemDyad", async ({ event, context }) => {
  console.log("Redeem DYAD");
  updateNote(event, context);
});

ponder.on("VaultManagerV4:Liquidate", async ({ event, context }) => {
  console.log("Liquidate DYAD");
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

ponder.on("DyadXP:Transfer", async ({ event, context }) => {
  console.log("DyadXP Transfer");
  const owner = event.args.to;

  try {
    const balanceOf = await context.client.readContract({
      abi: DNftAbi,
      address: "0xDc400bBe0B8B79C07A962EA99a642F5819e3b712",
      functionName: "balanceOf",
      args: [owner],
    });
    console.log("balanceOf", balanceOf);

    // for (let i = 0; i < parseInt(balance); i++) {
    for (let i = 0; i < balanceOf; i++) {
      const nftID = await context.client.readContract({
        abi: DNftAbi,
        address: "0xDc400bBe0B8B79C07A962EA99a642F5819e3b712",
        functionName: "tokenOfOwnerByIndex",
        args: [owner, BigInt(i)],
      });
      console.log("nftID", nftID);

      const { Note } = context.db;
      const cr = await getCr(context, nftID);
      const kerosene = await getKerosene(context, nftID);
      const dyad = await getDyad(context, nftID);
      const xp = await getXP(context, nftID, event);
      console.log("DYAD XP transfer", nftID, cr, kerosene, dyad, xp);
      await Note.update({
        id: nftID,
        data: {
          collatRatio: cr,
          kerosene: kerosene ?? 0,
          dyad: dyad,
          xp: xp,
        },
      });
    }
  } catch (e) {
    // console.log("error", e);
  }
});

ponder.on("KeroseneVault:Deposit", async ({ event, context }) => {
  console.log("Kerosene Deposit");
  console.log("getting kerosene");
  const xp = await getXP(context, event.args.id, event);
  const { Note } = context.db;
  await Note.update({
    id: event.args.id,
    data: {
      xp: xp,
    },
  });
});

ponder.on("KeroseneVault:Withdraw", async ({ event, context }) => {
  console.log("Kerosene Withdraw");
  console.log("getting kerosene");
  const xp = await getXP(context, event.args.id, event);
  const { Note } = context.db;
  await Note.update({
    id: event.args.id,
    data: {
      xp: xp,
    },
  });
});
