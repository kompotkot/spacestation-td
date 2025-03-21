import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { useAppKitAccount } from "@reown/appkit/react";

import { useGameContract } from "../hooks/useGameContracts";

// TODO: Not correctly functional, can duplicate sometimes game instances
// verify it code with TD.tsx and fix it

interface GameContextType {
    gameInstance: any | null;
    setGameInstance: (game: any | null) => void;
    destroyGame: () => void;
    address: string | null;
    playerLatestSession: number | null;
    isTransactionPending: boolean;
    playerMaxFinishedWave: number;
    selectedWave: number;
    setSelectedWave: (number: number | null) => void;
}

const GameContext = createContext<GameContextType>({
    gameInstance: null,
    setGameInstance: () => {},
    destroyGame: () => {},
    address: null,
    playerLatestSession: null,
    isTransactionPending: false,
    playerMaxFinishedWave: 0,
    selectedWave: 1,
    setSelectedWave: (wave: number) => {},
});

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const [gameInstance, setGameInstance] = useState<any | null>(null);

    const [selectedWave, setSelectedWave] = useState(1);

    const { address, isConnected } = useAppKitAccount();
    const gameContract = useGameContract();
    const {
        isTransactionPending,
        playerLatestSession,
        setPlayerLatestSession,
        playerMaxFinishedWave,
        setPlayerMaxFinishedWave,
    } = gameContract;

    const destroyGame = () => {
        if (gameInstance) {
            console.log("[INFO] Destroying game instance");
            gameInstance.destroy(true);
            setGameInstance(null);
        }
    };

    useEffect(() => {
        if (!isConnected) return;
        const loadContractData = async () => {
            const playerLatestSessionData =
                await gameContract.getPlayerLatestSession();
            setPlayerLatestSession(Number(playerLatestSessionData));

            const playerMaxFinishedWaveData =
                await gameContract.getPlayerMaxFinishedWave();
            setPlayerMaxFinishedWave(Number(playerMaxFinishedWaveData));
        };

        loadContractData();
    }, [isConnected]);

    useEffect(() => {
        if (window.gameSettings) {
            window.gameSettings.waveCount = selectedWave;
        }
    }, [selectedWave]);

    useEffect(() => {
        if (!window.gameContract) {
            window.gameContract = gameContract;
        }

        if (window.gameContract) {
            window.gameContract.playerLatestSession = playerLatestSession;
            window.gameContract.address = address;
            window.gameContract.isConnected = isConnected;
            window.gameContract.isTransactionPending = isTransactionPending;
        }

        // Initialize global game settings
        if (!window.gameSettings) {
            window.gameSettings = {
                gridSize: 128,
                health: 100,
                waveCount: selectedWave,
                enemyHealth: 100,
                enemySpeed: 100,
                difficultyModifier: 1.2,
                camera: {
                    zoomFactor: 0.5,
                    minZoom: 0.5,
                    maxZoom: 2,
                    panSpeed: 10,
                    zoomSpeed: 0.1,
                },
            };
        }

        // If game is already initialized, we can also update it directly
        if (gameInstance && gameInstance.registry) {
            gameInstance.registry.set("address", address || null);
            gameInstance.registry.set(
                "isTransactionPending",
                isTransactionPending
            );

            // If the menu scene is active, refresh it to show the new address
            const menuScene = gameInstance.scene.getScene("MenuScene");
            if (menuScene && menuScene.scene.isActive()) {
                menuScene.scene.restart();
            }
        }
    }, [
        gameContract,
        address,
        gameInstance,
        playerLatestSession,
        isTransactionPending,
        isConnected,
    ]);

    useEffect(() => {
        console.log(
            "[INFO] Player latest session number:",
            playerLatestSession
        );

        if (window.gameContract) {
            window.gameContract.playerLatestSession = playerLatestSession;
        }

        // Update the game instance with the new session
        if (gameInstance && gameInstance.registry) {
            gameInstance.registry.set(
                "playerLatestSession",
                playerLatestSession
            );

            // Refresh the menu scene if it's active
            const menuScene = gameInstance.scene.getScene("MenuScene");
            if (menuScene && menuScene.scene.isActive()) {
                menuScene.scene.restart();
            }
        }
    }, [playerLatestSession, gameInstance]);

    return (
        <GameContext.Provider
            value={{
                gameInstance,
                setGameInstance,
                destroyGame,
                address,
                playerLatestSession,
                isTransactionPending,
                playerMaxFinishedWave,
                selectedWave,
                setSelectedWave,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
