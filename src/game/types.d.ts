// Type definitions for the game

import { GameSettings } from "../types/GameTypes";

declare global {
    interface Window {
        gameSettings: GameSettings;
    }
}

// Phaser scene with fixed class references
declare class GameScene extends Phaser.Scene {
    startTowerPlacement(towerType: string): void;
    cancelTowerPlacement(): void;
}
