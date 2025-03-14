import React, { useEffect } from "react";
import Phaser from "phaser";

// Import scenes directly
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";

interface PhaserGameProps {
    parentElement: React.RefObject<HTMLDivElement>;
    backgroundColor: string;
    onGameLoaded: () => void;
}

// This component handles the Phaser game instance
const PhaserGame: React.FC<PhaserGameProps> = ({
    parentElement,
    backgroundColor,
    onGameLoaded,
}) => {
    useEffect(() => {
        // Make sure we have access to the DOM
        if (!parentElement.current) return;

        // Initialize global game settings
        window.gameSettings = {
            gridSize: 64,
            credits: 100,
            waveCount: 1,
            enemyHealth: 100,
            enemySpeed: 100,
            difficultyModifier: 1.2,
        };

        // Convert hex color to number format for Phaser if it's a hex string
        // const bgColor = backgroundColor.startsWith("#")
        //     ? parseInt(backgroundColor.replace("#", "0x"), 16)
        //     : backgroundColor;

        // Create a new Phaser game instance
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: parentElement.current,
            // backgroundColor: bgColor,
            // Pass the scene classes directly, not as an array property
            scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene],
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                },
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };

        // Create the game
        const game = new Phaser.Game(config);

        // Signal when the game is loaded (after boot scene)
        const bootScene = game.scene.getScene("BootScene");
        if (bootScene) {
            bootScene.events.once("create", () => {
                onGameLoaded();
            });
        } else {
            // Fallback if boot scene not found immediately
            setTimeout(() => onGameLoaded(), 1000);
        }

        // Clean up on unmount
        return () => {
            game.destroy(true);
        };
    }, [parentElement, backgroundColor, onGameLoaded]);

    // This component doesn't render anything visible
    return null;
};

export default PhaserGame;
