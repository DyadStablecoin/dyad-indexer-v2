import { Context, ponder } from "@/generated";
import ponderConfig from "../ponder.config";
import { Address, formatEther, formatUnits } from "viem";

const XP_TANH_FACTOR = 8;
const LP_TANH_FACTOR = 3;

ponder.on("ComputeRewards:block", async ({ event, context }) => {
    console.log("ComputeRewards:block", event.block.number);

    const BLOCK_TIME = 12;

    const { Pool, NoteLiquidity, Liquidity, RewardRate } = context.db;

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

            let thisFromBlock = Math.max(Number(fromBlock), Number(rate.blockNumber));

            await computeRewardsForPeriod(
                rate.rate, 
                pool.id as Address, 
                BigInt(thisFromBlock), 
                BigInt(lastToBlock), 
                context);

            lastToBlock = rate.blockNumber;
            
            if (rate.blockNumber < fromBlock) {
                break;
            }
        }
    }
});


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
    const noteLiquidity = await NoteLiquidity.findMany({
        where: {
            pool: pool,
            blockNumber: {
                gte: fromBlock,
                lt: toBlock
            },
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

        const boostedSize = tanhXP + tanhLP;
        totalSize += boostedSize;
        scaledSizeByNoteId[Number(noteId)] = boostedSize;
    }



}