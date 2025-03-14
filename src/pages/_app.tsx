import type { AppProps } from "next/app";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum, arbitrumSepolia } from "@reown/appkit/networks";
import { Chain } from "viem";
import { RelayKitProvider } from "@reservoir0x/relay-kit-ui";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "react-query";
import {
    convertViemChainToRelayChain,
    MAINNET_RELAY_API,
} from "@reservoir0x/relay-sdk";

import { ThemeProvider } from "../context/ThemeContext";
import { GameProvider } from "../context/GameContext";
import "../styles/globals.css";
import { relayTheme } from "../styles/relay";

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
    const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

    const metadata = {
        name: "Space Station TD",
        description: "Space Station Tower Defense game ",
        url: "http://192.168.21.128:3000/", // origin must match your domain & subdomain
        icons: ["https://avatars.githubusercontent.com/u/179229932"],
    };

    const networks = [mainnet, arbitrum, arbitrumSepolia] as [
        AppKitNetwork,
        ...AppKitNetwork[]
    ];
    const wagmiChains = [mainnet, arbitrum, arbitrumSepolia];
    const chains = wagmiChains.map((c) =>
        convertViemChainToRelayChain(c as Chain)
    );

    const wagmiAdapter = new WagmiAdapter({
        projectId,
        networks,
    });

    createAppKit({
        adapters: [wagmiAdapter],
        projectId: projectId,
        metadata: metadata,
        networks: networks,
        themeMode: "dark",
        features: {
            email: false,
            socials: [],
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <GameProvider>
                    <RelayKitProvider
                        theme={relayTheme}
                        options={{
                            appName: "getsome",
                            chains,
                            baseApiUrl: MAINNET_RELAY_API,
                        }}
                    >
                        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
                            <Component {...pageProps} />
                        </WagmiProvider>
                    </RelayKitProvider>
                </GameProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
