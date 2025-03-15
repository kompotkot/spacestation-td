// Type definitions for the game

declare global {
    interface Window {
        gameSettings: {
            gridSize: number;
            credits: number;
            waveCount: number;
            enemyHealth: number;
            enemySpeed: number;
            difficultyModifier: number;
            address: string;
        };
    }
}

// Phaser scene with fixed class references
declare class GameScene extends Phaser.Scene {
    startTowerPlacement(towerType: string): void;
    cancelTowerPlacement(): void;
}

// Export nothing, this is just for types
export {};
