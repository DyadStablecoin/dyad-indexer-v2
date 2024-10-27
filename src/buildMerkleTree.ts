import MerkleTree from "merkletreejs";
import { encodePacked, keccak256 } from "viem";


export function getLeaf(reward: {
    amount: bigint;
    id: bigint;
    lastUpdated: bigint;
}) {
    const packed = encodePacked(["uint256", "uint256"], [reward.id, reward.amount]);
    return keccak256(packed);
}

export function buildMerkleTree(allRewards: {
    amount: bigint;
    id: bigint;
    lastUpdated: bigint;
}[]) {

    const leaves = allRewards.map(getLeaf);

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    return tree;
}

