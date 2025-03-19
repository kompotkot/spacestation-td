import React, { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import TD from "../components/TD";
import Menu from "../components/Menu";
import useGraphWindowDimensions from "../hooks/useGraphWindowDimensions";
import styles from "../styles/Index.module.css";
import { useGame } from "../context/GameContext";

const Index = () => {
    const { width, height } = useGraphWindowDimensions();

    const [gameLoaded, setGameLoaded] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [showMenu, setShowMenu] = useState(false); // New state to track menu visibility
    const { backgroundMainColor, textMainColor } = useTheme();

    const { destroyGame, playerLatestSession } = useGame();

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

    // Handle wallet connection state changes
    useEffect(() => {
        if (isConnected && address) {
            setShowMenu(true); // Show menu when wallet is connected
        } else {
            setShowMenu(false);
            setGameStarted(false);
            setGameLoaded(false);
        }
    }, [isConnected, address]);

    // Function to start the game from the menu
    const handleStartGame = () => {
        setGameStarted(true);
        setShowMenu(false);
    };

    const handleGameOver = () => {
        console.log("[INFO] Game over, returning to menu");
        setGameLoaded(false);
        setGameStarted(false);
        destroyGame();
        setShowMenu(true); // Show the menu again

        try {
            const gameContract = window.gameContract;
            // await gameContract.completeGameSession(playerLatestSession);

            console.log("[INFO] Transaction successful, completed game");

            // await gameContract.getPlayerLatestSession()
        } catch (error) {
            console.error("[ERROR] Failed to complete game session:", error);
        }
    };

    return (
        <Layout>
            <div
                className={styles.game_container}
                style={{
                    // border: "1px solid purple",
                    color: textMainColor,
                }}
            >
                {gameStarted && (
                    <TD
                        setGameLoaded={setGameLoaded}
                        gameStarted={gameStarted}
                        width={width}
                        height={height}
                        onGameOver={handleGameOver}
                    />
                )}

                {!isConnected ? (
                    // Show connect wallet button if not connected
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
                ) : showMenu ? (
                    // Show menu when connected but game not started
                    <Menu onStartGame={handleStartGame} />
                ) : (
                    // Show loading indicator when game is starting but not loaded
                    gameStarted &&
                    !gameLoaded && (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                color: textMainColor,
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
