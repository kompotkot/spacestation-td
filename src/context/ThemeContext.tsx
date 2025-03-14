import { createContext, useContext, useState } from "react";

interface ThemeContextType {
    lightTheme: number;
    switchTheme: () => void;
    textMainColor: string;
    textOppositeColor: string;
    backgroundMainColor: string;
    backgroundShadowColor: string;
    nodeFetched: string;
    nodeUnknown: string;
    linkUnknown: string;
    linkKnown: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [lightTheme, setLightTheme] = useState<number>(0);

    const switchTheme = () => {
        setLightTheme((prevTheme) => (prevTheme === 0 ? 1 : 0));
    };

    const textMainColor = ["white", "#171717"][lightTheme];
    const textOppositeColor = ["#171717", "white"][lightTheme];
    const backgroundMainColor = ["#171717", "white"][lightTheme];
    const backgroundShadowColor = ["#171717", "white"][lightTheme];

    const nodeFetched = ["white", "#3b3f44"][lightTheme];
    const nodeUnknown = ["#25282d", "#d5d5d5"][lightTheme];
    const linkUnknown = ["#666", "#999"][lightTheme];
    const linkKnown = ["white", "#171717"][lightTheme];

    return (
        <ThemeContext.Provider
            value={{
                lightTheme,
                switchTheme,
                textMainColor,
                textOppositeColor,
                backgroundMainColor,
                backgroundShadowColor,
                nodeFetched,
                nodeUnknown,
                linkUnknown,
                linkKnown,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
