import config from "../ponder.config";
import { ponder } from "@/generated";

ponder.on("SetRoot:block", async ({ event, context }) => {
  console.log("SetRoot:block", event.block.number);

  const { Tvl } = context.db;

  const client = context.client;

  const results = await client.multicall({
    contracts: [
      {
        abi: config.contracts.Staking.abi,
        address: config.contracts.Staking.address,
        functionName: "merkleRoot",
      },
      {
        abi: config.contracts.Staking.abi,
        address: config.contracts.Staking.address,
        functionName: "lastUpdateBlock",
      }
    ]
  })
});