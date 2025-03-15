import React, { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import TD from "../components/TD";
import useGraphWindowDimensions from "../hooks/useGraphWindowDimensions";
import styles from "../styles/Index.module.css";

const Index = () => {
    const { width, height } = useGraphWindowDimensions();

    const [gameLoaded, setGameLoaded] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const { backgroundMainColor, textMainColor } = useTheme();

    // Using the AppKit hooks with your setup in _app.tsx
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();

    // Track the connection state
    const [isConnecting, setIsConnecting] = useState(false);

    // Function to handle wallet connection
    const connectWallet = async () => {
        setIsConnecting(true);

        try {
            // Open the AppKit wallet connection modal
            await open();
            // The connection state will be handled by useAppKitAccount
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    };

    // Start game when wallet is connected
    useEffect(() => {
        if (isConnected && address) {
            setGameStarted(true);
        } else {
            setGameStarted(false);
            setGameLoaded(false);
        }
    }, [isConnected, address]);

    return (
        <Layout>
            <div
                className={styles.game_container}
                style={{
                    // border: "1px solid purple",
                    color: textMainColor,
                }}
            >
                <TD
                    setGameLoaded={setGameLoaded}
                    gameStarted={gameStarted}
                    width={width}
                    height={height}
                />

                {!gameStarted ? (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: textMainColor,
                        }}
                    >
                        <span
                            onClick={connectWallet}
                            style={{
                                padding: "10px 20px",
                                border: `1px solid ${textMainColor}`,
                                borderRadius: "4px",
                                cursor: isConnecting ? "default" : "pointer",
                                opacity: isConnecting ? 0.7 : 1,
                            }}
                        >
                            {isConnecting ? "Connecting..." : "Connect Wallet"}
                        </span>
                    </div>
                ) : (
                    !gameLoaded && (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                color: textMainColor,
                                // border: "1px solid yellow",
                            }}
                        >
                            Loading...
                        </div>
                    )
                )}
            </div>
        </Layout>
    );
};

export default Index;
