import Head from "next/head";
import dynamic from "next/dynamic";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";

import { useGame } from "../context/GameContext";
import { useTheme } from "../context/ThemeContext";
import styles from "../styles/Layout.module.css";

// Dynamically import the Skybox component with no SSR
const Skybox = dynamic(() => import("./Skybox"), { ssr: false });

const Layout = ({ children, title = "Tower Defense" }) => {
    const { address, isConnected } = useAppKitAccount();
    const { disconnect } = useDisconnect();
    const { textMainColor, backgroundMainColor } = useTheme();
    const { destroyGame } = useGame();

    const handleLogout = () => {
        // Destroy the game first
        destroyGame();
        // Then disconnect the wallet
        disconnect();
    };

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="Tower Defense" />
                <link rel="icon" href="/favicon.svg" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Nunito"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <Skybox />

            <div
                className={styles.container}
                style={{
                    color: textMainColor,
                    backgroundColor: "transparent", // Transparent to show the skybox
                }}
            >
                <header>
                    <nav>
                        <ul className={styles.site_nav}>
                            <li className={styles.nav_first}></li>
                            {isConnected && address && (
                                <li className={styles.nav_account_info}>
                                    <span>{`${address.substring(
                                        0,
                                        6
                                    )}...${address.substring(
                                        address.length - 4
                                    )}`}</span>
                                    <img
                                        className={styles.icon}
                                        onClick={() => {
                                            handleLogout();
                                        }}
                                        src="logout.svg"
                                        alt="Logout"
                                    />
                                </li>
                            )}
                        </ul>
                    </nav>
                </header>
                <main className={styles.main}>{children}</main>
            </div>
        </>
    );
};

export default Layout;
