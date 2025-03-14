import { useQuery, UseQueryResult } from "react-query";
import axios from "axios";

import { AuthData } from "../types/AuthTypes";

const fetchAuth = async ({ queryKey }) => {
    const [, username, password] = queryKey;
    const url = new URL(`${process.env.NEXT_PUBLIC_AUTH_URI}/token`);
    const applicationId = process.env.NEXT_PUBLIC_AUTH_APPLICATION_ID;

    const formattedDate = new Date().toISOString().slice(0, 19);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("token_note", `forensics-${formattedDate}`);
    if (applicationId) {
        formData.append("application_id", applicationId);
    }

    const response = await axios.post(url.toString(), formData);
    return response.data;
};

const useAuth = (
    username: string,
    password: string,
    onSuccess: (data: AuthData) => void,
    onError: (error: unknown) => void,
    enabled: boolean = false
): UseQueryResult<AuthData, unknown> => {
    return useQuery<AuthData>(["auth", username, password], fetchAuth, {
        enabled, // Dynamically control when the query is triggered
        onSuccess: (data: AuthData) => {
            const { access_token } = data;
            if (access_token) {
                localStorage.setItem("accessToken", access_token);
            }
        },
        onError: (error: unknown) => {
            localStorage.removeItem("accessToken");

            onError(error);
        },
        select: (data: AuthData) => {
            return {
                access_token: data.access_token,
                user_id: data.user_id,
                token_type: data.token_type,
                note: data.note,
                active: data.active,
                created_at: data.created_at,
                updated_at: data.updated_at,
                restricted: data.restricted,
            };
        },
        retry: false,
        cacheTime: 0,
        refetchOnWindowFocus: false,
    });
};

export default useAuth;

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("accessToken");
};
