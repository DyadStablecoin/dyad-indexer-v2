import { createConfig, mergeAbis } from '@ponder/core';
import { fallback, http, parseAbiItem } from 'viem';

import { DNftAbi } from './abis/DNftAbi';
import { ERC1967ProxyAbi } from './abis/ERC1967ProxyAbi';
import { LPStakingAbi } from './abis/LPStaking';
import { LPStakingFactoryAbi } from './abis/LPStakingFactory';
import { VaultAbi } from './abis/VaultAbi';
import { VaultManagerV2_0x1342Abi } from './abis/VaultManagerV2_0x1342Abi';
import { VaultManagerV3_0x5c1aAbi } from './abis/VaultManagerV3_0x5c1aAbi';
import { VaultManagerV4_0x2592Abi } from './abis/VaultManagerV4_0x2592Abi';
import { XpABI } from './abis/XpAbi';
import { LAST_REWARDS_BLOCK } from './generated/rewardsSnapshot';
import { config } from './src/config';
import {
  DYAD_NFT_DEPLOYMENT_BLOCK,
  DYAD_XP_DEPLOYMENT_BLOCK,
  KEROSENE_VAULT_DEPLOYMENT_BLOCK,
  REWARDS_DEPLOYMENT_BLOCK,
  VAULT_MANAGER_DEPLOYMENT_BLOCK,
} from './src/constants';

const lpIndexingStartBlock = LAST_REWARDS_BLOCK;

// config
export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: fallback(
        [
          http(config.rpcUrl),
          fallback([
            http('https://eth.llamarpc.com'),
            http('https://rpc.ankr.com/eth'),
            http('https://eth-mainnet.public.blastapi.io'),
            http('https://eth.rpc.blxrbdn.com'),
          ]),
        ],
        {
          rank: false,
        },
      ),
    },
  },
  blocks: {
    GetXP: {
      network: 'mainnet',
      startBlock: LAST_REWARDS_BLOCK - 100,
      // interval: 1, // every 1 blocks
      interval: 100, // every 100 blocks
    },
    IndexLPBalances: {
      network: 'mainnet',
      startBlock: lpIndexingStartBlock,
      interval: 5, // every 5 blocks
    },
    ComputeRewards: {
      network: 'mainnet',
      startBlock: lpIndexingStartBlock,
      interval: 1800, // every 6 hours
    },
  },
  contracts: {
    LPStakingFactory: {
      abi: LPStakingFactoryAbi,
      address: '0xD19DCbB8B82805d779a6A2182d8F4355275CC30a',
      network: 'mainnet',
      startBlock: REWARDS_DEPLOYMENT_BLOCK,
    },
    Staking: {
      abi: LPStakingAbi,
      network: 'mainnet',
      factory: {
        address: '0xD19DCbB8B82805d779a6A2182d8F4355275CC30a',
        event: parseAbiItem(
          'event PoolStakingCreated(address indexed lpToken, address indexed staking)',
        ),
        parameter: 'staking',
      },
      startBlock: REWARDS_DEPLOYMENT_BLOCK,
    },
    VaultManagerV4: {
      abi: mergeAbis([
        ERC1967ProxyAbi,
        VaultManagerV2_0x1342Abi,
        VaultManagerV3_0x5c1aAbi,
        VaultManagerV4_0x2592Abi,
      ]),
      address: '0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7',
      network: 'mainnet',
      startBlock: VAULT_MANAGER_DEPLOYMENT_BLOCK,
    },
    DNft: {
      abi: DNftAbi,
      address: '0xDc400bBe0B8B79C07A962EA99a642F5819e3b712',
      network: 'mainnet',
      startBlock: DYAD_NFT_DEPLOYMENT_BLOCK,
    },
    KeroseneVault: {
      abi: VaultAbi,
      address: '0x4808e4CC6a2Ba764778A0351E1Be198494aF0b43',
      network: 'mainnet',
      startBlock: KEROSENE_VAULT_DEPLOYMENT_BLOCK,
    },
    DyadXP: {
      abi: XpABI,
      address: '0xeF443646E52d1C28bd757F570D18F4Db30dB70F4',
      network: 'mainnet',
      startBlock: DYAD_XP_DEPLOYMENT_BLOCK,
    },
  },
});
