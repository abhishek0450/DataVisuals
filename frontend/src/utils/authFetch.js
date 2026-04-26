import { clearAuthSession, getAccessToken, setAccessToken, setStoredUser } from "./auth";

let refreshRequestPromise = null;

const shouldAttemptRefresh = async (response) => {
    if (response.status !== 401) {
        return false;
    }

    try {
        const payload = await response.clone().json();
        return ["TOKEN_EXPIRED", "ACCESS_TOKEN_MISSING", "INVALID_ACCESS_TOKEN"].includes(payload?.code);
    } catch {
        return true;
    }
};

const refreshAccessToken = async () => {
    const response = await fetch("/api/user/refresh", {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Refresh token request failed");
    }

    const payload = await response.json();
    if (!payload?.success || !payload?.accessToken) {
        throw new Error("Refresh token response is invalid");
    }

    setAccessToken(payload.accessToken);
    if (payload.user) {
        setStoredUser(payload.user);
    }

    return payload.accessToken;
};

const getRefreshedTokenOnce = async () => {
    if (!refreshRequestPromise) {
        refreshRequestPromise = refreshAccessToken().finally(() => {
            refreshRequestPromise = null;
        });
    }

    return refreshRequestPromise;
};

export const authFetch = async (url, options = {}, allowRetry = true) => {
    const headers = new Headers(options.headers || {});
    const accessToken = getAccessToken();

    if (accessToken && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });

    if (!allowRetry || !(await shouldAttemptRefresh(response))) {
        return response;
    }

    try {
        const nextAccessToken = await getRefreshedTokenOnce();
        const retryHeaders = new Headers(options.headers || {});
        retryHeaders.set("Authorization", `Bearer ${nextAccessToken}`);

        return fetch(url, {
            ...options,
            headers: retryHeaders,
            credentials: "include"
        });
    } catch {
        clearAuthSession();
        return response;
    }
};
