import type { AppProps } from "next/app";

import { QueryProviders } from "../utils/queryProviders";

import { ThemeProvider } from "../context/ThemeContext";
import { GameProvider } from "../context/GameContext";
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
    return (
        <QueryProviders>
            <ThemeProvider>
                <GameProvider>
                    <Component {...pageProps} />
                </GameProvider>
            </ThemeProvider>
        </QueryProviders>
    );
}

export default App;
