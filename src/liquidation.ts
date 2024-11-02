import { Context } from "@/generated";
import { Block, Log, mergeAbis, Transaction } from "@ponder/core";
import { encodeAbiParameters, fromHex, keccak256, parseAbi, parseEventLogs, Prettify, zeroAddress } from "viem";
import { VaultManagerV4_0x2592Abi } from "../abis/VaultManagerV4_0x2592Abi";
import { DyadAbi } from "../abis/DyadAbi";

interface LiquidateEvent {
    name: "Liquidate";
    args: {
        id: bigint;
        from: `0x${string}`;
        to: bigint;
    };
    log: Log
    block: Block;
    transaction: Prettify<Transaction>;
    transactionReceipt?: undefined;
}

export async function handleLiquidate({ event, context }: { event: LiquidateEvent, context: Context }) {

    const { Liquidation, LiquidationDetail, Note } = context.db;

    let amount = BigInt(0);
    if (event.log.data !== `0x`) {
        amount = fromHex(event.log.data, "bigint");
    }

    const tx = await context.client.request({
        method: "eth_getTransactionReceipt",
        params: [event.transaction.hash],
    });

    const { id: fromNoteId, to: toNoteId } = event.args;

    let collateralAmounts = [];

    if (tx) {
        const logs = parseEventLogs({
            abi: mergeAbis([
                VaultManagerV4_0x2592Abi,
                parseAbi(["event Move(uint256 indexed from, uint256 indexed to, uint256 amount)"]),
                DyadAbi,
            ]),
            logs: tx.logs,
        })

        for (const log of logs) {
            console.log(log);
            if (log.eventName === "Move" && log.args.from === fromNoteId && log.args.to === toNoteId) {
                collateralAmounts.push({
                    vault: log.address,
                    amount: log.args.amount,
                });
            } else if (amount === 0n && log.eventName === "Transfer" && log.args.to === zeroAddress && log.address === "0xfd03723a9a3abe0562451496a9a394d2c4bad4ab") {
                amount = log.args.amount;
            }
        }
    }

    await Liquidation.create({
        id: event.transaction.hash,
        data: {
            fromNoteId,
            toNoteId,
            blockNumber: event.block.number,
            amount,
            timestamp: event.block.timestamp,
        }
    });

    await LiquidationDetail.createMany({
        data: collateralAmounts.map((collateral) => ({
            id: keccak256(encodeAbiParameters(
                [{ type: "bytes32", name: "liquidationId" }, { type: "address", name: "vault" }],
                [event.transaction.hash, collateral.vault]
            )),
            liquidationId: event.transaction.hash,
            vault: collateral.vault,
            amount: collateral.amount,
            timestamp: event.block.timestamp,
        })),
    });

    await Note.upsert({
        id: event.args.id,
        update: {
            lastLiquidation: event.block.timestamp,
        },
        create: {
            lastLiquidation: event.block.timestamp,
        }
    })
}
