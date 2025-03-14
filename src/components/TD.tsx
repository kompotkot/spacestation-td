import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

import styles from "../styles/TD.module.css";

const TD: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const [gameLoaded, setGameLoaded] = useState(false);
    const { backgroundMainColor, textMainColor } = useTheme();

    // Game Phaser initializer
    // Import libraries only on the client side
    const GamePhaserInit = async () => {
        try {
            // Dynamic import of Phaser
            const Phaser = (await import("phaser")).default;

            // Import scene classes
            const BootSceneModule = await import("../game/scenes/BootScene");
            const PreloadSceneModule = await import(
                "../game/scenes/PreloadScene"
            );
            const MenuSceneModule = await import("../game/scenes/MenuScene");
            const GameSceneModule = await import("../game/scenes/GameScene");
            const UISceneModule = await import("../game/scenes/UIScene");

            // Get the scene classes
            const BootScene = BootSceneModule.BootScene;
            const PreloadScene = PreloadSceneModule.PreloadScene;
            const MenuScene = MenuSceneModule.MenuScene;
            const GameScene = GameSceneModule.GameScene;
            const UIScene = UISceneModule.UIScene;

            // Initialize global game settings
            window.gameSettings = {
                gridSize: 64,
                credits: 100,
                waveCount: 1,
                enemyHealth: 100,
                enemySpeed: 100,
                difficultyModifier: 1.2,
            };

            // Convert hex color to number format for Phaser
            const bgColor = backgroundMainColor.startsWith("#")
                ? parseInt(backgroundMainColor.replace("#", "0x"), 16)
                : backgroundMainColor;

            // FIX: Updated game dimensions to ensure the full canvas is visible
            // We ensure the width is a multiple of gridSize for proper alignment
            const gridSize = window.gameSettings.gridSize;
            const containerWidth = gameRef.current.clientWidth;
            const containerHeight = gameRef.current.clientHeight;

            // Calculate game width and height to be multiples of gridSize
            const gameWidth = Math.floor(containerWidth / gridSize) * gridSize;
            const gameHeight =
                Math.floor(containerHeight / gridSize) * gridSize;

            // Create Phaser game configuration
            const config = {
                type: Phaser.AUTO, // Should be WEBGL
                width: gameWidth,
                height: gameHeight,
                parent: gameRef.current,
                backgroundColor: bgColor,
                scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene],
                physics: {
                    default: "arcade", // TODO: Migrate to "matter"
                    arcade: {
                        debug: true,
                    },
                },
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    width: gameWidth,
                    height: gameHeight,
                },
            };

            // Initialize the game
            const game = new Phaser.Game(config);

            // Set loaded state once the game is initialized
            setGameLoaded(true);

            // Clean up on unmount
            return () => {
                game.destroy(true);
                setGameLoaded(false);
            };
        } catch (error) {
            console.error("Error initializing Phaser game:", error);
        }
    };

    // Initialize Phaser on component mount
    useEffect(() => {
        if (typeof window === "undefined" || !gameRef.current) return;
        
        GamePhaserInit();
    }, []);

    return (
        <div
          className={styles.game_container}
            style={{
                width: "100%", // Increased width to ensure right side isn't cut off
                height: "600px",
                border: "1px solid purple",
            }}
        >
            <div
                ref={gameRef}
                id="phaser-game"
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: backgroundMainColor,
                }}
            />

            {!gameLoaded && (
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
            )}
        </div>
    );
};

export default TD;
