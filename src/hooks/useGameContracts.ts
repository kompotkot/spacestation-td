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
    const [pendingPromiseResolvers, setPendingPromiseResolvers] =
        useState(null);

    // Get the write contract function from wagmi
    const {
        writeContract,
        isPending,
        isError,
        isSuccess,
        data: transactionData,
        error: transactionError,
    } = useWriteContract();

    // Watch for transaction state changes
    useEffect(() => {
        if (isSuccess && pendingPromiseResolvers) {
            console.log("[INFO] Transaction succeeded:", transactionData);
            setIsTransactionPending(false);
            pendingPromiseResolvers.resolve(transactionData);
            setPendingPromiseResolvers(null);
        }

        if (isError && pendingPromiseResolvers) {
            console.warn("[WARN] Transaction failed:", transactionError);
            setIsTransactionPending(false);
            pendingPromiseResolvers.reject(transactionError);
            setPendingPromiseResolvers(null);
        }
    }, [
        isSuccess,
        isError,
        transactionData,
        transactionError,
        pendingPromiseResolvers,
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

    const completeGameSession = (sessionId) => {
        return new Promise((resolve, reject) => {
            try {
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
                        console.error(
                            "[ERROR] Game session completion timed out"
                        );
                        reject(new Error("Transaction timed out"));
                    }
                }, 120000); // 2 minutes timeout

                // Clear timeout on unmount
                return () => clearTimeout(timeoutId);
            } catch (error) {
                setIsTransactionPending(false);
                setPendingPromiseResolvers(null);
                console.error("[ERROR] Error completing game session:", error);
                reject(error);
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
