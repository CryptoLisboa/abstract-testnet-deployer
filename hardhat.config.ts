import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-verify";

import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";

// Load environment variables from .env file
dotenv.config();

const config: HardhatUserConfig = {
    zksolc: {
        settings: {
            experimental: {
                zk: true,
            },
            libraries: {},
            enableEraVMExtensions: false,
            forceEVMLA: false,
            optimizer: {
                enabled: true,
                mode: "3",
            },
        },
    },
    defaultNetwork: "abstractTestnet",
    networks: {
        abstractTestnet: {
            url: "https://api.testnet.abs.xyz",
            ethNetwork: "sepolia",
            zksync: true,
            verifyURL: "https://api-explorer-verify.testnet.abs.xyz/contract_verification",
        },
    },
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};

export default config;
