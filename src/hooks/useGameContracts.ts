import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract, useWriteContract } from "wagmi";

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

    const { writeContract, isSuccess } = useWriteContract();

    const readContract = useReadContract({
        address: SPACE_STATION_CONTRACT_ADDRESS,
        abi: SpaceStationABI,
        functionName: "getNumSessions",
        query: {
            enabled: false, // disable the query in onload
        },
    });

    const getTotalSessions = async () => {
        try {
            const { data } = await readContract.refetch();
            if (data) {
                console.log("[INFO] Total number of sessions: ", Number(data));
                return Number(data);
            }
        } catch (error) {
            console.error("[ERROR] Error getting number of sessions:", error);
            return null;
        }
    };

    const startGameSession = async () => {
        try {
            const data = writeContract({
                address: SPACE_STATION_CONTRACT_ADDRESS,
                abi: SpaceStationABI,
                functionName: "startSession",
                args: [],
                chain: game7Testnet,
                account: address as `0x${string}`,
            });

            console.log("[INFO] Game session started, data:", data);
            return null;
        } catch (error) {
            console.error("Error starting game session:", error);
            return null;
        }
    };

    const completeGameSession = async (sessionId) => {
        // try {
        //     const hash = await writeContractAsync({
        //         address: SPACE_STATION_CONTRACT_ADDRESS,
        //         abi: SpaceStationABI,
        //         functionName: "completeSession",
        //         args: [sessionId],
        //         chain: game7Testnet,
        //         account: address as `0x${string}`,
        //     });

        //     console.log("Game session completed, TX hash:", hash);
        //     return true;
        // } catch (error) {
        //     console.error("Error completing game session:", error);
        //     return false;
        // }
        return null;
    };

    return {
        startGameSession,
        completeGameSession,
        getTotalSessions,
        isConnected: !!address,
        address,
    };
}
