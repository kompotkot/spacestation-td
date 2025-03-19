import type {
    PersistedClient,
    Persister,
    PersistQueryClientOptions,
} from "@tanstack/query-persist-client-core";
import type { QueryClient } from "@tanstack/react-query";
import { del, get, set } from "idb-keyval";

function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
    return {
        persistClient: async (client: PersistedClient) => {
            // Create a custom serialization to handle BigInt values
            const serializedClient = JSON.parse(
                JSON.stringify(client, (key, value) =>
                    typeof value === "bigint" ? value.toString() + "n" : value
                )
            );
            await set(idbValidKey, serializedClient);
        },
        restoreClient: async () => {
            // Get the data and parse any serialized BigInt values
            const data = await get<PersistedClient>(idbValidKey);
            if (!data) return data;

            // Parse serialized BigInts when restoring the client
            return JSON.parse(JSON.stringify(data), (key, value) => {
                if (typeof value === "string" && /^\d+n$/.test(value)) {
                    return BigInt(value.slice(0, -1));
                }
                return value;
            });
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    } as Persister;
}

const persister = () => createIDBPersister("wagmi.cache");

export const createPersistConfig = ({
    queryClient,
}: {
    queryClient: QueryClient;
}): PersistQueryClientOptions => ({
    queryClient,
    persister: persister(),
    dehydrateOptions: {
        shouldDehydrateQuery: (query: any) =>
            query.gcTime !== 0 &&
            query.queryHash !== JSON.stringify([{ entity: "signer" }]),
    },
    buster: process.env.CONFIG_BUILD_ID,
});
