import React, { useState, useEffect } from "react";

import { useGame } from "../context/GameContext";
import styles from "../styles/Menu.module.css";
import { GAME_WAVES } from "../utils/settings";

interface MenuProps {
    onStartGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
    const [loading, setLoading] = useState(false);

    const {
        address,
        playerLatestSession,
        isTransactionPending,
        availableWave,
        selectedWave,
        setSelectedWave,
    } = useGame();

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

            {/* Wave selection dropdown */}
            <label
                style={{
                    color: "#ffffff",
                    fontSize: "18px",
                    marginBottom: "10px",
                }}
            >
                Select Starting Wave:
            </label>
            <select
                value={selectedWave}
                onChange={(e) => setSelectedWave(Number(e.target.value))}
                style={{
                    width: "240px",
                    padding: "10px",
                    fontSize: "18px",
                    borderRadius: "4px",
                    border: "1px solid #0099ff",
                    background: "transparent", // Transparent background
                    color: "#ffffff",
                    cursor: "pointer",
                    textAlign: "center",
                    marginBottom: "20px",
                    appearance: "none", // Remove default dropdown styling
                    outline: "none",
                }}
            >
                {GAME_WAVES.map((_, index) => {
                    const waveNumber = index + 1;
                    return (
                        <option
                            key={index}
                            value={waveNumber}
                            disabled={waveNumber > availableWave} // Disable if wave is above availableWave
                            style={{
                                background: "#222222", // Background color inside dropdown
                                color:
                                    waveNumber > availableWave
                                        ? "#888888"
                                        : "#ffffff", // Grey out unavailable options
                                cursor:
                                    waveNumber > availableWave
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            Wave {waveNumber}{" "}
                            {waveNumber > availableWave ? "(Locked)" : ""}
                        </option>
                    );
                })}
            </select>

            <button
                onClick={handleStartGame}
                disabled={loading || isTransactionPending}
                style={{
                    background:
                        loading || isTransactionPending ? "#666666" : "#0066aa",
                    color: "#ffffff",
                    border: `1px solid ${
                        loading || isTransactionPending ? "#888888" : "#0099ff"
                    }`,
                    borderRadius: "4px",
                    padding: "10px 20px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    cursor:
                        loading || isTransactionPending ? "default" : "pointer",
                    fontFamily: "JetBrains Mono",
                    width: "240px",
                    height: "60px",
                }}
                onMouseOver={(e) => {
                    if (!loading && !isTransactionPending)
                        e.currentTarget.style.backgroundColor = "#0099ff";
                }}
                onMouseOut={(e) => {
                    if (!loading && !isTransactionPending)
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
