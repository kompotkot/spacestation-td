import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract, useWriteContract } from "wagmi";
import { useState, useEffect } from "react";

import SpaceStationABI from "../web3/abi/SpaceStation.json";
import { game7Testnet } from "../web3/chains";

export const SPACE_STATION_CONTRACT_ADDRESS = validateAddress(
    process.env.NEXT_PUBLIC_SPACE_STATION_CONTRACT_ADDRESS
);

function validateAddress(address: string | undefined): `0x${string}` {
    if (!address) {
        throw new Error(
            "Contract address is not defined in environment variables"
        );
    }

    if (!address.startsWith("0x") || address.length !== 42) {
        throw new Error(`Invalid contract address format: ${address}`);
    }

    return address as `0x${string}`;
}

export function useGameContract() {
    const { address } = useAppKitAccount();
    const [playerLatestSession, setPlayerLatestSession] = useState<
        number | null
    >(null);
    const [isTransactionPending, setIsTransactionPending] = useState(false);
    const [pendingPromiseResolvers, setPendingPromiseResolvers] = useState<{
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    } | null>(null);

    // Get the write contract function from wagmi
    const {
        writeContract,
        isPending,
        isError,
        isSuccess,
        data: transactionData,
        error: transactionError,
        reset: resetWriteContract,
    } = useWriteContract();

    // Watch for transaction state changes and handle user rejections
    useEffect(() => {
        // Early return if no transaction is happening
        if (!isPending && !isError && !isSuccess) return;
        if (isSuccess && pendingPromiseResolvers) {
            console.log("[INFO] Transaction succeeded:", transactionData);
            setIsTransactionPending(false);
            pendingPromiseResolvers.resolve(transactionData);
            setPendingPromiseResolvers(null);
        }

        if (isError) {
            console.warn("[WARN] Transaction failed:", transactionError);
            setIsTransactionPending(false);

            // Check if error is user rejection
            const errorMessage = transactionError?.message || "";
            const isUserRejection =
                errorMessage.includes("User rejected") ||
                errorMessage.includes("user rejected") ||
                errorMessage.includes("rejected the request");

            if (isUserRejection) {
                console.log("[INFO] User rejected transaction in wallet");
            }

            // Only attempt to reject the promise if pendingPromiseResolvers exists
            if (pendingPromiseResolvers) {
                if (isUserRejection) {
                    // pendingPromiseResolvers.reject(new Error("User rejected the transaction"));
                    console.log("rejected tx");
                } else {
                    pendingPromiseResolvers.reject(transactionError);
                }
                setPendingPromiseResolvers(null);
            }

            // Always reset the contract state
            resetWriteContract();
        }
    }, [
        isSuccess,
        isError,
        transactionData,
        transactionError,
        pendingPromiseResolvers,
        resetWriteContract,
    ]);

    const usePlayerLatestSession = useReadContract({
        address: SPACE_STATION_CONTRACT_ADDRESS,
        abi: SpaceStationABI,
        functionName: "getPlayerLatestSession",
        args: [address as `0x${string}`],
        query: {
            enabled: false, // disable the query in onload
        },
    });

    const getPlayerLatestSession = async () => {
        try {
            const { data } = await usePlayerLatestSession.refetch();
            if (data) {
                console.log(
                    "[INFO] Latest user session number: ",
                    Number(data)
                );
                setPlayerLatestSession(Number(data));
                return Number(data);
            }
        } catch (error) {
            console.error("[ERROR] Error getting latest user session", error);
            return null;
        }
    };

    const startGameSession = () => {
        return new Promise((resolve, reject) => {
            try {
                // Store the promise resolvers for use when transaction completes
                setPendingPromiseResolvers({ resolve, reject });
                setIsTransactionPending(true);

                // Prepare the transaction
                writeContract({
                    address: SPACE_STATION_CONTRACT_ADDRESS,
                    abi: SpaceStationABI,
                    functionName: "startSession",
                    args: [],
                    chain: game7Testnet,
                    account: address as `0x${string}`,
                });

                // Add a timeout
                const timeoutId = setTimeout(() => {
                    if (isTransactionPending) {
                        setIsTransactionPending(false);
                        setPendingPromiseResolvers(null);
                        resetWriteContract();
                        console.error(
                            "[ERROR] Game session transaction timed out"
                        );
                        reject(new Error("Transaction timed out"));
                    }
                }, 120000); // 2 minutes timeout

                // Clear timeout on unmount
                return () => clearTimeout(timeoutId);
            } catch (error) {
                setIsTransactionPending(false);
                setPendingPromiseResolvers(null);
                console.error("[ERROR] Error initiating game session:", error);
                reject(error);
            }
        });
    };

    const completeGameSession = (sessionId: number) => {
        return new Promise((resolve, reject) => {
            try {
                // Reset any previous state
                resetWriteContract();

                // Store the promise resolvers for use when transaction completes
                setPendingPromiseResolvers({ resolve, reject });
                setIsTransactionPending(true);

                // Prepare the transaction
                writeContract({
                    address: SPACE_STATION_CONTRACT_ADDRESS,
                    abi: SpaceStationABI,
                    functionName: "completeSession",
                    args: [sessionId],
                    chain: game7Testnet,
                    account: address as `0x${string}`,
                });

                // Add a timeout
                const timeoutId = setTimeout(() => {
                    if (isTransactionPending) {
                        setIsTransactionPending(false);
                        setPendingPromiseResolvers(null);
                        resetWriteContract();
                        console.error(
                            "[ERROR] Game session completion timed out"
                        );
                        reject(new Error("Transaction timed out"));
                    }
                }, 120000); // 2 minutes timeout

                // Return a cleanup function
                return () => clearTimeout(timeoutId);
            } catch (error: any) {
                setIsTransactionPending(false);
                setPendingPromiseResolvers(null);
                resetWriteContract();

                // Log and format the error
                console.error("[ERROR] Error completing game session:", error);

                // Check if it's a user rejection
                if (
                    error?.message?.includes("User rejected") ||
                    error?.message?.includes("user rejected") ||
                    error?.message?.includes("rejected the request")
                ) {
                    console.log("rejected tx");
                    // reject(new Error("User rejected the transaction"));
                } else {
                    reject(error);
                }
            }
        });
    };

    return {
        startGameSession,
        completeGameSession,
        getPlayerLatestSession,
        isConnected: !!address,
        address,
        isTransactionPending,
        playerLatestSession,
    };
}
