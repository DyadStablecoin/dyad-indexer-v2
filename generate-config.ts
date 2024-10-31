import fs from "fs/promises";
import * as url from 'node:url';
import { buildMerkleTree } from "./src/buildMerkleTree";
import path from "path";

async function main() {
    console.log("Generating rewards snapshot...");

    const allItems: any[] = [];
    let cursor: string | undefined = undefined;
    let hasNextPage: boolean = false
    do {
        const after = cursor ? `, after: "${cursor}"` : "";
        const response = await fetch("https://api.dyadstable.xyz/graphql", {
            method: "POST",
        headers: {
            "Content-Type": "application/graphql"
        },
        body: `query {
                    totalRewards(limit: 1000${after}){
                        items{
                            id
                            amount
                            lastUpdated
                        },
                        pageInfo{
                            hasNextPage
                            endCursor
                        }
                    }
                }`
        });
        const data = await response.json() as any;
        hasNextPage = data.data.totalRewards.pageInfo.hasNextPage;
        cursor = data.data.totalRewards.pageInfo.endCursor;
        allItems.push(...data.data.totalRewards.items);
    } while (hasNextPage)

    const lastBlock = Math.max(...allItems.map((item) => Number(item.lastUpdated)));

    const modulePath = url.fileURLToPath(import.meta.url);
    const generatedPath = path.join(path.dirname(modulePath), "generated/rewardsSnapshot.ts");
    
    await fs.writeFile(generatedPath, 
`export const LAST_REWARDS_BLOCK = ${lastBlock};
export const REWARDS = ${JSON.stringify(allItems, null, 2)};`)

    console.log("Rewards snapshot generated.");
    console.log("Last block: ", lastBlock);
    console.log("Notes with rewards: ", allItems.length);

    const merkleTree = buildMerkleTree(allItems);
    console.log("Merkle root: ", merkleTree.getHexRoot());
}


if (import.meta.url.startsWith('file:')) { // (A)
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) { // (B)
    main().then(() => {
        process.exit(0);
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
  }
}