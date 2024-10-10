import { createConfig, mergeAbis } from "@ponder/core";
import { http } from "viem";

import { ERC1967ProxyAbi } from "./abis/ERC1967ProxyAbi";
import { VaultManagerV2_0x1342Abi } from "./abis/VaultManagerV2_0x1342Abi";
import { VaultManagerV3_0x5c1aAbi } from "./abis/VaultManagerV3_0x5c1aAbi";
import { VaultManagerV4_0x2592Abi } from "./abis/VaultManagerV4_0x2592Abi";
import { VaultManagerV5_0xabc0Abi } from "./abis/VaultManagerV5_0xabc0Abi";

import { DNftAbi } from "./abis/DNftAbi";
import { VaultAbi } from "./abis/VaultAbi";
import { XpABI } from "./abis/XpAbi";


// config
export default createConfig({
  networks: {
    mainnet: { chainId: 1, transport: http(process.env.PONDER_RPC_URL_1) },
  },
  blocks: {
    GetXP: {
      network: "mainnet",
      // startBlock: 20330541,
      startBlock: 20461672 - 100,
      // interval: 1, // every 1 blocks
      interval: 100, // every 100 blocks
    },
  },
  contracts: {
    VaultManagerV4: {
      abi: mergeAbis([
        ERC1967ProxyAbi,
        VaultManagerV2_0x1342Abi,
        VaultManagerV3_0x5c1aAbi,
        VaultManagerV4_0x2592Abi,
        VaultManagerV5_0xabc0Abi
      ]),
      address: "0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7",
      network: "mainnet",
      startBlock: 20441603,
    },
    DNft: {
      abi: DNftAbi,
      address: "0xDc400bBe0B8B79C07A962EA99a642F5819e3b712",
      network: "mainnet",
      startBlock: 17733160,
    },
    KeroseneVault: {
      abi: VaultAbi,
      address: "0x4808e4CC6a2Ba764778A0351E1Be198494aF0b43",
      network: "mainnet",
      startBlock: 20055920,
    },
    DyadXP: {
      abi: XpABI,
      address: "0xeF443646E52d1C28bd757F570D18F4Db30dB70F4",
      network: "mainnet",
      startBlock: 20292276,
    },
  },
});
