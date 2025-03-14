import React, { createContext, useContext, useState, ReactNode } from "react";

// TODO: Not correctly functional, can duplicate sometimes game instances
// verify it code with TD.tsx and fix it

interface GameContextType {
    gameInstance: any | null;
    setGameInstance: (game: any | null) => void;
    destroyGame: () => void;
}

const GameContext = createContext<GameContextType>({
    gameInstance: null,
    setGameInstance: () => {},
    destroyGame: () => {},
});

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const [gameInstance, setGameInstance] = useState<any | null>(null);

    const destroyGame = () => {
        if (gameInstance) {
            console.log("Destroying game instance");
            gameInstance.destroy(true);
            setGameInstance(null);
        }
    };

    return (
        <GameContext.Provider
            value={{
                gameInstance,
                setGameInstance,
                destroyGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
