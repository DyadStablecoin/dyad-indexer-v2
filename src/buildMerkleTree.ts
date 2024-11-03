import { MerkleTree } from 'merkletreejs';
import { encodePacked, keccak256 } from 'viem';

export function getLeaf(reward: {
  amount: bigint;
  id: bigint;
  lastUpdated: bigint;
}) {
  const packed = encodePacked(
    ['uint256', 'uint256'],
    [reward.id, reward.amount],
  );
  const leaf = keccak256(keccak256(packed));
  return leaf;
}

export function buildMerkleTree(
  allRewards: {
    amount: bigint;
    id: bigint;
    lastUpdated: bigint;
  }[],
) {
  const leaves = allRewards.map(getLeaf);

  const tree = new MerkleTree(leaves, keccak256<'bytes'>, { sortPairs: true });
  return tree;
}
