import React, { useState, useEffect } from "react";

import { useTheme } from "../context/ThemeContext";
import useAuth, { isAuthenticated } from "../hooks/useAuth";
import styles from "../styles/Auth.module.css";

const Auth: React.FC = () => {
    const {
        lightTheme,
        switchTheme,
        textMainColor,
        textOppositeColor,
        backgroundMainColor,
        backgroundShadowColor,
        nodeFetched,
        nodeUnknown,
    } = useTheme();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [shouldAuthenticate, setShouldAuthenticate] = useState(false);

    useEffect(() => {
        // Only show the popup if not authenticated
        if (!isAuthenticated()) {
            setIsOpen(true);
        }
    }, []);

    const onSuccess = () => {
        if (isAuthenticated()) {
            setIsOpen(false);
        }
        setShouldAuthenticate(false);
    };

    const onError = (error) => {
        console.log(error?.message);
    };

    const { isLoading, data, error } = useAuth(
        username,
        password,
        onSuccess,
        onError,
        shouldAuthenticate
    );

    useEffect(() => {
        if (isAuthenticated()) {
            setIsOpen(false);
        }
    }, [data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setShouldAuthenticate(true); // Trigger authentication
    };

    // Don't render anything if not open
    if (!isOpen) return null;

    return (
        <div
            className={styles.overlay}
            style={{ backgroundColor: backgroundShadowColor, opacity: 0.95 }}
        >
            <div
                className={styles.popup}
                style={{
                    backgroundColor: backgroundShadowColor,
                    borderColor: textMainColor,
                }}
            >
                <h2
                    className={styles.header}
                    style={{ color: textMainColor, borderColor: textMainColor }}
                >
                    Authentication
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <input
                            id="username"
                            type="text"
                            className={styles.input}
                            style={{
                                color: textMainColor,
                                backgroundColor: backgroundShadowColor,
                                borderColor: textMainColor,
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            placeholder="username"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            id="password"
                            type="password"
                            className={styles.input}
                            style={{
                                color: textMainColor,
                                backgroundColor: backgroundShadowColor,
                                borderColor: textMainColor,
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            required
                        />
                    </div>
                    {error && (
                        <div className={styles.error}>
                            {error instanceof Error
                                ? error.message
                                : "Login failed"}
                        </div>
                    )}
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                        style={{
                            color: "white",
                        }}
                    >
                        {isLoading ? "Authenticating..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
