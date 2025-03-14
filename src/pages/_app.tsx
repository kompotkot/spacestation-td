import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";

import { ThemeProvider } from "../context/ThemeContext";
import "../styles/globals.css";

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <Component {...pageProps} />
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
