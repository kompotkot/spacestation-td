import React, { useState, useEffect } from "react";

import { useGame } from "../context/GameContext";
import styles from "../styles/Menu.module.css";

interface MenuProps {
    onStartGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
    const [loading, setLoading] = useState(false);

    const { address, playerLatestSession } = useGame();

    const handleStartGame = async () => {
        console.log("[INFO] Starting game process...");

        if (!address) {
            console.error("[ERROR] Wallet not connected");
            return;
        }

        // Show loading message
        setLoading(true);

        try {
            console.log("[INFO] Calling startGameSession");

            const gameContract = window.gameContract;

            // Call the contract function to start a game session
            await gameContract.startGameSession();

            console.log("[INFO] Transaction successful, starting game");

            // Start game scenes
            onStartGame();
        } catch (error) {
            console.error("[ERROR] Failed to start game session:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <h1
                style={{
                    fontSize: "32px",
                }}
            >
                SPACE STATION DEFENDER
            </h1>

            <h2
                style={{
                    fontSize: "20px",
                    color: "#cccccc",
                }}
            >
                Defend against aliens, monsters and space pirates
            </h2>

            <div
                style={{
                    margin: "20px 0",
                    color: "#ffcc00",
                    fontSize: "18px",
                    textAlign: "center",
                }}
            >
                <p style={{ margin: "10px 0" }}>Wallet: {address}</p>
                <p style={{ margin: "10px 0" }}>
                    Player latest session number:{" "}
                    {playerLatestSession !== null
                        ? playerLatestSession
                        : "None"}
                </p>
            </div>

            <button
                onClick={handleStartGame}
                disabled={loading}
                style={{
                    background: "#0066aa",
                    color: "#ffffff",
                    border: `1px solid #0099ff`,
                    borderRadius: "4px",
                    padding: "10px 20px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    cursor: loading ? "default" : "pointer",
                    fontFamily: "JetBrains Mono",
                    width: "240px",
                    height: "60px",
                }}
                onMouseOver={(e) => {
                    if (!loading)
                        e.currentTarget.style.backgroundColor = "#0099ff";
                }}
                onMouseOut={(e) => {
                    if (!loading)
                        e.currentTarget.style.backgroundColor = "#0066aa";
                }}
            >
                START GAME
            </button>

            <div
                style={{
                    textAlign: "center",
                    color: "#cccccc",
                    fontSize: "16px",
                    margin: "40px 0",
                    maxWidth: "600px",
                    lineHeight: "1.5",
                }}
            >
                <p>
                    Click on the station floor to place defenses. Protect your
                    station from waves of enemies. Don't let enemies reach the
                    exit!
                </p>
            </div>
        </div>
    );
};

export default Menu;
