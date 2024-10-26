import { Context, ponder } from "@/generated";
import ponderConfig from "../ponder.config";
import { Address, encodeAbiParameters, encodePacked, formatEther, formatUnits, keccak256 } from "viem";
import MerkleTree from "merkletreejs";

const XP_TANH_FACTOR = 8;
const LP_TANH_FACTOR = 3;

const BLOCK_TIME = 12;

ponder.on("ComputeRewards:block", async ({ event, context }) => {
    console.log("ComputeRewards:block", event.block.number);

    const { Pool, RewardRate, Reward } = context.db;

    const pools = await Pool.findMany();

    const toBlock = event.block.number;
    const fromBlock = toBlock - BigInt(ponderConfig.blocks.ComputeRewards.interval);

    for (const pool of pools.items) {
        const rewardRate = await RewardRate.findMany({
            where: {
                pool: pool.id,
                blockNumber: {
                    lt: toBlock
                }
            },
            orderBy: {
                blockNumber: "desc"
            }
        });

        let lastToBlock = toBlock;

        for (let i = 0; i < rewardRate.items.length; i++) {
            const rate = rewardRate.items[i]!;

            if (rate.rate === 0n) {
                continue;
            }

            let thisFromBlock = BigInt(Math.max(Number(fromBlock), Number(rate.blockNumber)));

            const rewardsForPeriod = await computeRewardsForPeriod(
                rate.rate, 
                pool.id as Address, 
                BigInt(thisFromBlock), 
                BigInt(lastToBlock), 
                context);

            await Reward.createMany({
                data: Object.entries(rewardsForPeriod).map(([noteId, rewards]) => ({
                    id: keccak256(encodeAbiParameters([
                        { type: "uint256" },
                        { type: "address" },
                        { type: "uint256" },
                        { type: "uint256" },
                    ], [BigInt(noteId), pool.id as Address, thisFromBlock, lastToBlock])),
                    noteId: BigInt(noteId),
                    amount: BigInt(rewards),
                    pool: pool.id,
                    fromBlockNumber: BigInt(thisFromBlock),
                    toBlockNumber: BigInt(lastToBlock),
                    timestamp: event.block.timestamp,
                }))
            })

            lastToBlock = rate.blockNumber;
            
            if (rate.blockNumber < fromBlock) {
                break;
            }
        }
    }

    const root = await computeTotalRewards(toBlock, context);

    console.log("Root", root);

    // TODO: Update the root onchain
});

async function computeTotalRewards(blockNumber: bigint, context: Context) {
    const client = context.client;
    const { Reward, TotalReward } = context.db;

    const dnftSupply = await client.readContract({
        abi: ponderConfig.contracts.DNft.abi,
        address: ponderConfig.contracts.DNft.address,
        functionName: "totalSupply",
    });

    for (let i = 0; i < dnftSupply; i++) {
        const rewards = await Reward.findMany({
            where: {
                noteId: BigInt(i)
            }
        });

        const totalReward = rewards.items.reduce((acc, curr) => acc + curr.amount, 0n);

        if (totalReward === 0n) {
            continue;
        }

        await TotalReward.upsert({
            id: BigInt(i),
            create: {
                amount: totalReward,
                lastUpdated: blockNumber
            },
            update: (options) => {
                if (options.current.lastUpdated >= blockNumber) {
                    return options.current;
                }
                return {
                    amount: totalReward,
                    lastUpdated: blockNumber
                }
            }
        });
    }

    const allRewards = await TotalReward.findMany();

    const leaves = allRewards.items.map((reward) => {
        const packed = encodePacked(["uint256", "uint256"], [reward.id, reward.amount]);
        return keccak256(packed);
    });

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    return tree.getHexRoot();
}

async function computeRewardsForPeriod(rewardRate: bigint, pool: Address, fromBlock: bigint, toBlock: bigint, context: Context) {
    const { Liquidity, NoteLiquidity } = context.db;

    const liquidity = await Liquidity.findMany({
        where: {
            pool: pool,
            blockNumber: {
                gte: fromBlock,
                lt: toBlock
            }
        }
    });
    const totalSnapshotsInPeriod = liquidity.items.length;

    if (totalSnapshotsInPeriod === 0) {
        return {};
    }

    const noteLiquidity = await NoteLiquidity.findMany({
        where: {
            pool: pool,
            blockNumber: {
                gte: fromBlock,
                lt: toBlock
            },
            liquidity: {
                gt: 0n
            }
        }
    });

    let totalLiquidityInPeriod = 0n;
    let totalXpInPeriod = 0n;
    let participants: Record<number, { liquidity: bigint, xp: bigint }> = {};

    for (const note of noteLiquidity.items) {
        const noteId = Number(note.noteId);
        totalLiquidityInPeriod += note.liquidity;
        totalXpInPeriod += note.xp;
        if (!participants[noteId]) {
            participants[noteId] = { liquidity: 0n, xp: 0n };
        }
        participants[noteId].liquidity += note.liquidity;
        participants[noteId].xp += note.xp;
    }

    const totalXpScaled = Number(formatUnits(totalXpInPeriod / BigInt(totalSnapshotsInPeriod), 27));
    const totalLiquidityScaled = Number(formatUnits(totalLiquidityInPeriod, 18));

    let totalSize = 0;
    let scaledSizeByNoteId: Record<number, number> = {};

    for (const [noteId, participant] of Object.entries(participants)) {
        const scaledXp = Number(formatUnits(participant.xp / BigInt(totalSnapshotsInPeriod), 27));
        const scaledLiquidity = Number(formatUnits(participant.liquidity, 18));

        const tanhXP = XP_TANH_FACTOR * Math.tanh(scaledXp / totalXpScaled)
        const tanhLP = LP_TANH_FACTOR * Math.tanh(scaledLiquidity / totalLiquidityScaled);

        const boostedSize = tanhXP * tanhLP;
        totalSize += boostedSize;
        scaledSizeByNoteId[Number(noteId)] = boostedSize;
    }

    const totalRewardsForPeriod = Number(formatEther(rewardRate * BigInt(BLOCK_TIME) * (fromBlock - toBlock)));

    let rewardsByNoteId: Record<number, number> = {};

    for (const [noteId, scaledSize] of Object.entries(scaledSizeByNoteId)) {
        const shareOfTotal = scaledSize / totalSize;
        const rewardsForNote = totalRewardsForPeriod * shareOfTotal;
        rewardsByNoteId[Number(noteId)] = rewardsForNote;
    }

    return rewardsByNoteId;
}