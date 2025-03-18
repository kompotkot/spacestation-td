// Type definitions for the game

import { GameSettings } from "../types/GameTypes";

type SessionId = string;

declare global {
    interface Window {
        gameContract?: {
            startGameSession: () => Promise<string | null>;
            completeGameSession: (
                sessionId: SessionId
            ) => Promise<boolean | null>;
            getTotalSessions: () => Promise<number | null>;
            isConnected: boolean;
            address: string | null | undefined;
        };
        gameSettings: GameSettings;
    }
}

// Phaser scene with fixed class references
declare class GameScene extends Phaser.Scene {
    startTowerPlacement(towerType: string): void;
    cancelTowerPlacement(): void;
}
