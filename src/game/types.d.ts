// Type definitions for the game

import { GameSettings } from "../types/GameTypes";

declare global {
    interface Window {
        gameContract?: {
            startGameSession: () => Promise<unknown | null>;
            completeGameSession: (
                sessionId: number,
                maxFinishedWave: number
            ) => Promise<unknown | null>;
            getPlayerLatestSession: () => Promise<number | null>;
            getPlayerMaxFinishedWave: () => Promise<number | null>;
            isConnected: boolean;
            address: string | null | undefined;
            isTransactionPending: boolean;
            playerLatestSession: number;
        };
        gameSettings: GameSettings;
    }
}

// Phaser scene with fixed class references
declare class GameScene extends Phaser.Scene {
    startTowerPlacement(towerType: string): void;
    cancelTowerPlacement(): void;
}
