import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract, useWriteContract } from "wagmi";
import { useState, useEffect, useRef, useCallback } from "react";
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

    // Refs to store resolvers and timeout IDs (prevents async state issues)
    const pendingPromiseResolversRef = useRef<{
        resolve: (value: any) => void;
        reject: (reason?: any) => void;
    } | null>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    // Wagmi transaction handlers
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
        if (!isPending && !isError && !isSuccess) return;

        if (isSuccess && pendingPromiseResolversRef.current) {
            console.log("[INFO] Transaction succeeded:", transactionData);
            setIsTransactionPending(false);
            pendingPromiseResolversRef.current.resolve(transactionData);
            pendingPromiseResolversRef.current = null;
            if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        }

        if (isError) {
            console.warn("[WARN] Transaction failed:", transactionError);
            setIsTransactionPending(false);

            // Handle user rejection
            const errorMessage = transactionError?.message || "";
            const isUserRejection =
                errorMessage.includes("User rejected") ||
                errorMessage.includes("rejected the request");

            if (isUserRejection) {
                console.log("[INFO] User rejected transaction in wallet");
            }

            if (pendingPromiseResolversRef.current) {
                if (isUserRejection) {
                    console.log("[INFO] Transaction was rejected by user.");
                } else {
                    pendingPromiseResolversRef.current.reject(transactionError);
                }
                pendingPromiseResolversRef.current = null;
            }

            resetWriteContract();
        }
    }, [
        isSuccess,
        isError,
        transactionData,
        transactionError,
        resetWriteContract,
    ]);

    // Read contract function
    const usePlayerLatestSession = useReadContract({
        address: SPACE_STATION_CONTRACT_ADDRESS,
        abi: SpaceStationABI,
        functionName: "getPlayerLatestSession",
        args: [address as `0x${string}`],
        query: { enabled: false },
    });

    const getPlayerLatestSession = async () => {
        try {
            const { data } = await usePlayerLatestSession.refetch();
            if (data) {
                console.log("[INFO] Latest user session number:", Number(data));
                setPlayerLatestSession(Number(data));
                return Number(data);
            }
        } catch (error) {
            console.error("[ERROR] Error getting latest user session", error);
            return null;
        }
    };

    // Function to start a game session
    const startGameSession = useCallback(() => {
        return new Promise((resolve, reject) => {
            try {
                // Store promise resolvers in ref
                pendingPromiseResolversRef.current = { resolve, reject };
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

                // Set timeout for the transaction
                timeoutIdRef.current = setTimeout(() => {
                    if (isTransactionPending) {
                        console.error(
                            "[ERROR] Game session transaction timed out"
                        );
                        setIsTransactionPending(false);
                        pendingPromiseResolversRef.current = null;
                        resetWriteContract();
                        reject(new Error("Transaction timed out"));
                    }
                }, 120000);
            } catch (error) {
                setIsTransactionPending(false);
                pendingPromiseResolversRef.current = null;
                console.error("[ERROR] Error initiating game session:", error);
                reject(error);
            }
        });
    }, [writeContract, resetWriteContract, isTransactionPending]);

    // Function to complete a game session
    const completeGameSession = useCallback(
        (sessionId: number) => {
            return new Promise((resolve, reject) => {
                try {
                    resetWriteContract();

                    pendingPromiseResolversRef.current = { resolve, reject };
                    setIsTransactionPending(true);

                    writeContract({
                        address: SPACE_STATION_CONTRACT_ADDRESS,
                        abi: SpaceStationABI,
                        functionName: "completeSession",
                        args: [sessionId],
                        chain: game7Testnet,
                        account: address as `0x${string}`,
                    });

                    timeoutIdRef.current = setTimeout(() => {
                        if (isTransactionPending) {
                            console.error(
                                "[ERROR] Game session completion timed out"
                            );
                            setIsTransactionPending(false);
                            pendingPromiseResolversRef.current = null;
                            resetWriteContract();
                            reject(new Error("Transaction timed out"));
                        }
                    }, 120000);
                } catch (error: any) {
                    setIsTransactionPending(false);
                    pendingPromiseResolversRef.current = null;
                    resetWriteContract();

                    console.error(
                        "[ERROR] Error completing game session:",
                        error
                    );

                    if (error?.message?.includes("User rejected")) {
                        console.log("rejected tx");
                    } else {
                        reject(error);
                    }
                }
            });
        },
        [writeContract, resetWriteContract, isTransactionPending]
    );

    return {
        startGameSession,
        completeGameSession,
        getPlayerLatestSession,
        isConnected: !!address,
        address,
        isTransactionPending,
        playerLatestSession,
        setPlayerLatestSession,
    };
}
