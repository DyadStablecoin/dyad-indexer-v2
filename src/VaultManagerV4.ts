import { ponder } from "@/generated";

ponder.on("VaultManagerV4:Upgraded", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("VaultManagerV4:Added", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("VaultManagerV4:BurnDyad", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("VaultManagerV4:Initialized", async ({ event, context }) => {
  console.log(event.args);
});
