import { Context } from "@/generated";
import ponderConfig from "../ponder.config";
import { Address, createPublicClient, encodeAbiParameters, encodeFunctionData, formatEther, formatUnits, Hex, keccak256, parseEther, Prettify } from "viem";
import { Defender } from "@openzeppelin/defender-sdk";
import { mainnet } from "viem/chains";
import { buildMerkleTree } from "./buildMerkleTree";
import { XP_TANH_FACTOR, LP_TANH_FACTOR, BLOCK_TIME } from "./constants";
import { Block } from "@ponder/core";

export async function handleComputeRewards({ event, context }: { event: {
    block: Prettify<Block>;
}, context: Context }) {
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
                    amount: rewards,
                    pool: pool.id,
                    fromBlockNumber: thisFromBlock,
                    toBlockNumber: lastToBlock,
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

    // create public client to mainnet for reading the latest block
    const latestClient = createPublicClient({
        chain: mainnet,
        transport: ponderConfig.networks.mainnet.transport
    });

    const lastOnchainUpdateBlock = await latestClient.readContract({
        abi: ponderConfig.contracts.LPStakingFactory.abi,
        address: ponderConfig.contracts.LPStakingFactory.address,
        functionName: "lastUpdateBlock"
    });

    if (lastOnchainUpdateBlock < toBlock 
        && process.env.RELAY_API_KEY 
        && process.env.RELAY_API_SECRET
        && process.env.RAILWAY_ENVIRONMENT_NAME === "production") {
        console.log("Setting root onchain", toBlock);
        const defender = new Defender({
            relayerApiKey: process.env.RELAY_API_KEY,
            relayerApiSecret: process.env.RELAY_API_SECRET,
        });

        await defender.relaySigner.sendTransaction({
            to: ponderConfig.contracts.LPStakingFactory.address,
            data: encodeFunctionData({
                abi: ponderConfig.contracts.LPStakingFactory.abi,
                functionName: "setRoot",
                args: [root as Hex, event.block.number]
            }),
            gasLimit: 100_000
        })
    }
};

async function computeTotalRewards(blockNumber: bigint, context: Context) {
    const client = context.client;
    const { Reward, TotalReward } = context.db;

    const dnftSupply = await client.readContract({
        abi: ponderConfig.contracts.DNft.abi,
        address: ponderConfig.contracts.DNft.address,
        functionName: "totalSupply",
        blockNumber
    });

    for (let i = 0; i < dnftSupply; i++) {
        const lastTotalReward = await TotalReward.findUnique({
            id: BigInt(i)
        });

        const rewards = await Reward.findMany({
            where: {
                noteId: BigInt(i),
                fromBlockNumber: {
                    // use gte here because the last updated reward
                    // does not include the rewards computed in that block
                    gte: lastTotalReward?.lastUpdated
                }
            }
        });

        const lastTotalRewardAmount = lastTotalReward?.amount ?? 0n;
        const totalReward = lastTotalRewardAmount + rewards.items.reduce((acc, curr) => acc + curr.amount, 0n);

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

    let cursor: string | undefined = undefined;
    let hasNextPage = false;
    const allRewards: any[] = [];
    do {
        const rewards = await TotalReward.findMany({ 
            after: cursor,
            limit: 1000 
        });
        allRewards.push(...rewards.items);
        hasNextPage = rewards.pageInfo.hasNextPage;
        cursor = rewards.pageInfo.endCursor ?? undefined;
    } while (hasNextPage)


    const tree = buildMerkleTree(allRewards);
    return tree.getHexRoot();
}

export async function computeRewardsForPeriod(rewardRate: bigint, pool: Address, fromBlock: bigint, toBlock: bigint, context: Context) {
    const { Liquidity, NoteLiquidity } = context.db;

    const liquidityItems = [];

    let cursor: string | undefined = undefined;
    let hasNextPage = false;
    do {
        const liquidity = await Liquidity.findMany({
            limit: 1000,
            after: cursor,
            where: {
                pool: pool,
                blockNumber: {
                    gte: fromBlock,
                    lt: toBlock
                }
            }
        });
        liquidityItems.push(...liquidity.items);
        hasNextPage = liquidity.pageInfo.hasNextPage;
        cursor = liquidity.pageInfo.endCursor ?? undefined;
    } while (hasNextPage)
    const totalSnapshotsInPeriod = liquidityItems.length;

    if (totalSnapshotsInPeriod === 0) {
        return {};
    }

    const noteLiquidityItems: any[] = [];
    cursor = undefined;
    hasNextPage = false;
    do {
        const noteLiquidity = await NoteLiquidity.findMany({
            limit: 1000,
            after: cursor,
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
        noteLiquidityItems.push(...noteLiquidity.items);
        hasNextPage = noteLiquidity.pageInfo.hasNextPage;
        cursor = noteLiquidity.pageInfo.endCursor ?? undefined;
    } while (hasNextPage)

    let totalLiquidityInPeriod = 0n;
    let totalXpInPeriod = 0n;
    let numberOfParticipants = 0;
    let participants: Record<number, { liquidity: bigint, xp: bigint }> = {};

    for (const note of noteLiquidityItems) {
        const noteId = Number(note.noteId);
        totalLiquidityInPeriod += note.liquidity;
        totalXpInPeriod += note.xp;
        if (!participants[noteId]) {
            participants[noteId] = { liquidity: 0n, xp: 0n };
            numberOfParticipants++;
        }
        participants[noteId]!.liquidity += note.liquidity;
        participants[noteId]!.xp += note.xp;
    }

    const totalXpScaled = Number(formatUnits(totalXpInPeriod / BigInt(totalSnapshotsInPeriod), 27)) / numberOfParticipants;
    const totalLiquidityScaled = Number(formatUnits(totalLiquidityInPeriod / BigInt(totalSnapshotsInPeriod), 18)) / numberOfParticipants;

    let totalSize = 0;
    let scaledSizeByNoteId: Record<number, number> = {};

    for (const [noteId, participant] of Object.entries(participants)) {
        const scaledXp = Number(formatUnits(participant.xp / BigInt(totalSnapshotsInPeriod), 27));
        const scaledLiquidity = Number(formatUnits(participant.liquidity / BigInt(totalSnapshotsInPeriod), 18));

        const tanhXP = XP_TANH_FACTOR * Math.tanh(scaledXp / totalXpScaled)
        const tanhLP = LP_TANH_FACTOR * Math.tanh(scaledLiquidity / totalLiquidityScaled);

        const boostedSize = tanhXP * tanhLP;
        totalSize += boostedSize;
        scaledSizeByNoteId[Number(noteId)] = boostedSize;
    }

    const totalRewardsForPeriod = Number(formatEther(rewardRate * BigInt(BLOCK_TIME) * (toBlock - fromBlock)));

    const rewardsByNoteId: Record<number, bigint> = {};

    for (const [noteId, scaledSize] of Object.entries(scaledSizeByNoteId)) {
        const shareOfTotal = scaledSize / totalSize;
        const rewardsForNote = parseEther((totalRewardsForPeriod * shareOfTotal).toFixed(18));

        rewardsByNoteId[Number(noteId)] = rewardsForNote;
    }

    return rewardsByNoteId;
}