import React, { useEffect, useRef, useState } from "react";

import { useGame } from "../context/GameContext";

interface TDProps {
    setGameLoaded: (loaded: boolean) => void;
    gameStarted: boolean;
    width: number;
    height: number;
    handleGameOver?: () => void;
}

const TD: React.FC<TDProps> = ({
    setGameLoaded,
    gameStarted,
    width,
    height,
    handleGameOver,
}) => {
    const gameRef = useRef<HTMLDivElement>(null);
    const { setGameInstance } = useGame();
    // const { backgroundMainColor, textMainColor } = useTheme();

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
            const GameSceneModule = await import("../game/scenes/GameScene");
            const UISceneModule = await import("../game/scenes/UIScene");

            // Get the scene classes
            const BootScene = BootSceneModule.BootScene;
            const PreloadScene = PreloadSceneModule.PreloadScene;
            const GameScene = GameSceneModule.GameScene;
            const UIScene = UISceneModule.UIScene;

            // Convert hex color to number format for Phaser
            // const bgColor = backgroundMainColor.startsWith("#")
            //     ? parseInt(backgroundMainColor.replace("#", "0x"), 16)
            //     : backgroundMainColor;

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
                scene: [BootScene, PreloadScene, GameScene, UIScene],
                transparent: true,
                physics: {
                    default: "arcade", // TODO: Migrate to "matter"
                    arcade: {
                        debug: false,
                        gravity: { x: 0, y: 0 }, // No gravity for top-down view
                    },
                },
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    width: gameWidth,
                    height: gameHeight,
                },
                // Add input configuration for mouse wheel
                input: {
                    keyboard: true,
                    mouse: true,
                    touch: true,
                    gamepad: false,
                },
                // Ensure pixel art looks crisp when zoomed
                render: {
                    pixelArt: true,
                    antialias: false,
                    roundPixels: true,
                },
            };

            // Initialize the game
            const game = new Phaser.Game(config);

            game.registry.set("onGameOver", async () => {
                game.destroy(true);
                setGameLoaded(false);
                await handleGameOver();
            });

            // Set loaded state once the game is initialized
            setGameLoaded(true);

            setGameInstance(game);

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

        if (gameStarted) {
            GamePhaserInit();
        }
    }, [gameStarted]);

    return (
        <div
            ref={gameRef}
            style={{
                width: width,
                height: height,
                // border: "1px solid red",
            }}
        />
    );
};

export default TD;
