import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { arbitrumSepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

import { createPersistConfig } from "./persist";
import { game7Testnet } from "../web3/chains";
import { queryClient } from "./customQueryClient";

type Props = {
    children: ReactNode;
};

export function QueryProviders({ children }: Props) {
    const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
    const projectUri =
        process.env.NEXT_PUBLIC_PROJECT_URI || "https://space-station-td.io";

    const metadata = {
        name: "Space Station TD",
        description: "Space Station Tower Defense game ",
        url: projectUri, // origin must match your domain & subdomain
        icons: ["https://avatars.githubusercontent.com/u/179229932"],
    };

    const networks = [arbitrumSepolia, game7Testnet] as [
        AppKitNetwork,
        ...AppKitNetwork[]
    ];
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
        <WagmiProvider
            config={wagmiAdapter.wagmiConfig}
            reconnectOnMount={typeof window !== "undefined"}
        >
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={createPersistConfig({ queryClient })}
            >
                {children}
                <ReactQueryDevtools
                    initialIsOpen={false}
                    buttonPosition="bottom-left"
                />
            </PersistQueryClientProvider>
        </WagmiProvider>
    );
}
