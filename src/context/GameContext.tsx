import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { useAppKitAccount } from "@reown/appkit/react";

// TODO: Not correctly functional, can duplicate sometimes game instances
// verify it code with TD.tsx and fix it

interface GameContextType {
    gameInstance: any | null;
    setGameInstance: (game: any | null) => void;
    destroyGame: () => void;
    address: string | null;
}

const GameContext = createContext<GameContextType>({
    gameInstance: null,
    setGameInstance: () => {},
    destroyGame: () => {},
    address: null,
});

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const [gameInstance, setGameInstance] = useState<any | null>(null);

    const { address } = useAppKitAccount();

    const destroyGame = () => {
        if (gameInstance) {
            console.log("Destroying game instance");
            gameInstance.destroy(true);
            setGameInstance(null);
        }
    };

    useEffect(() => {
        // Initialize global game settings
        if (!window.gameSettings) {
            window.gameSettings = {
                gridSize: 128,
                credits: 100,
                health: 100,
                waveCount: 1,
                enemyHealth: 100,
                enemySpeed: 1000,
                difficultyModifier: 1.2,
                address: address,
                camera: {
                    zoomFactor: 0.5,
                    minZoom: 0.5,
                    maxZoom: 2,
                    panSpeed: 10,
                    zoomSpeed: 0.1,
                },
            };
        }

        if (window.gameSettings) {
            window.gameSettings.address = address || null;
        }

        // If game is already initialized, we can also update it directly
        if (gameInstance && gameInstance.registry) {
            gameInstance.registry.set("address", address || null);

            // If the menu scene is active, refresh it to show the new address
            const menuScene = gameInstance.scene.getScene("MenuScene");
            if (menuScene && menuScene.scene.isActive()) {
                menuScene.scene.restart();
            }
        }
    }, [address, gameInstance]);

    return (
        <GameContext.Provider
            value={{
                gameInstance,
                setGameInstance,
                destroyGame,
                address,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
