import { createConfig, mergeAbis } from "@ponder/core";
import { http } from "viem";

import { ERC1967ProxyAbi } from "./abis/ERC1967ProxyAbi";
import { VaultManagerV2_0x1342Abi } from "./abis/VaultManagerV2_0x1342Abi";
import { VaultManagerV3_0x5c1aAbi } from "./abis/VaultManagerV3_0x5c1aAbi";
import { VaultManagerV4_0x2592Abi } from "./abis/VaultManagerV4_0x2592Abi";

// config
export default createConfig({
  networks: {
    mainnet: { chainId: 1, transport: http(process.env.PONDER_RPC_URL_1) },
  },
  contracts: {
    VaultManagerV4: {
      abi: mergeAbis([
        ERC1967ProxyAbi,
        VaultManagerV2_0x1342Abi,
        VaultManagerV3_0x5c1aAbi,
        VaultManagerV4_0x2592Abi,
      ]),
      address: "0xB62bdb1A6AC97A9B70957DD35357311e8859f0d7",
      network: "mainnet",
      startBlock: 20055921,
    },
  },
});
