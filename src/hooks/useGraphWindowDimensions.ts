import { useState, useEffect } from "react";

const useGraphWindowDimensions = () => {
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const updateDimensions = () => {
            const mainElement = document.querySelector("main");
            if (mainElement) {
                setDimensions({
                    width: mainElement.clientWidth - 5, // Minus 5 is used to reduce margins
                    height: mainElement.clientHeight - 40, // Minus 5 is used to reduce margins
                });
            }
        };

        updateDimensions(); // Initial call to set dimensions
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return dimensions;
};

export default useGraphWindowDimensions;
