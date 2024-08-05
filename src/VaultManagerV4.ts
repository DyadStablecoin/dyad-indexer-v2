import { ponder } from "@/generated";
import { VaultManagerAbi } from "../abis/VaultManagerAbi";
import { VaultAbi } from "../abis/VaultAbi";
import { DyadAbi } from "../abis/DyadAbi";
import { DNftAbi } from "../abis/DNftAbi";
import { XpABI } from "../abis/XpAbi";

ponder.on("GetXP:block", async ({ event, context }) => {
  console.log("GetXP:block", event.block.number);
  const totalSupply = await context.client.readContract({
    abi: DNftAbi,
    address: "0xDc400bBe0B8B79C07A962EA99a642F5819e3b712",
    functionName: "totalSupply",
  });

  for (let id = 0; id < totalSupply; id++) {
    updateNote(context, id);
  }
});

ponder.on("VaultManagerV4:Liquidate", async ({ event, context }) => {
  const { Note } = context.db;
  await Note.upsert({
    id: BigInt(event.args.id),
    create: {
      lastLiquidation: event.block.timestamp,
    },
  });
});

async function updateNote(context, id) {
  const results = await context.client.multicall({
    contracts: [
      {
        abi: VaultManagerAbi,
        address: "0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7",
        functionName: "collatRatio",
        args: [id],
      },
      {
        abi: VaultAbi,
        address: "0x4808e4CC6a2Ba764778A0351E1Be198494aF0b43",
        functionName: "id2asset",
        args: [id],
      },
      {
        abi: DyadAbi,
        address: "0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab",
        functionName: "mintedDyad",
        args: [id],
      },
      {
        abi: XpABI,
        address: "0xeF443646E52d1C28bd757F570D18F4Db30dB70F4",
        functionName: "balanceOfNote",
        args: [id],
      },
      {
        abi: VaultManagerAbi,
        address: "0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7",
        functionName: "getTotalValue",
        args: [id],
      },
    ],
  });

  const collatRatio = results[0].result;
  const kerosene = results[1].result;
  const dyad = results[2].result;
  const xp = results[3].result;
  const collateral = results[4].result;
  console.log(
    "results",
    results[0].result,
    results[1].result,
    results[2].result,
    results[3].result,
    results[4].result
  );

  console.log("updating note", id, collatRatio, kerosene, dyad, xp, collateral);

  const { Note } = context.db;
  await Note.upsert({
    id: BigInt(id),
    update: {
      collatRatio: collatRatio,
      kerosene: kerosene,
      dyad: dyad,
      xp: xp,
      collateral: collateral,
    },
  });
}
