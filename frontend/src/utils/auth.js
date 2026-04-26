const ACCESS_TOKEN_KEY = "token";
const USER_KEY = "user";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};

export const setStoredUser = (user) => {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

export const hasAccessToken = () => Boolean(getAccessToken());

export const clearAuthSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("workspaceDataMap");
    localStorage.removeItem("workspaceChartMap");
};
