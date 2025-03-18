import { Chain } from "viem/chains";

export const game7Testnet = {
    id: 13746,
    name: "G7 Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Testnet Game7 Token",
        symbol: "TG7T",
    },
    rpcUrls: {
        default: {
            http: ["https://testnet-rpc.game7.build"],
        },
    },
    contracts: {
        // multicall3: {
        //   address: '0x...',
        // },
    },
} as const satisfies Chain;
