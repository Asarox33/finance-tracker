const BASE_URL = "/api";

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!payload.exp) return false;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export function getToken(): string | null {
    /* istanbul ignore next */
    if (typeof window === "undefined") return null;
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) return null;
        if (isTokenExpired(token)) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_id");
            return null;
        }
        return token;
    } catch {
        return null;
    }
}

export function setToken(token: string): void {
    /* istanbul ignore next */
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
}

export function removeToken(): void {
    /* istanbul ignore next */
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
}

export function getUserId(): string | null {
    /* istanbul ignore next */
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("user_id");
    } catch {
        return null;
    }
}

export function setUserId(id: string): void {
    /* istanbul ignore next */
    if (typeof window === "undefined") return;
    localStorage.setItem("user_id", id);
}

export function removeUserId(): void {
    /* istanbul ignore next */
    if (typeof window === "undefined") return;
    localStorage.removeItem("user_id");
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {...options, headers});

    if (res.status === 401 && !path.startsWith("/auth/")) {
        removeToken();
        removeUserId();
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
        return undefined as T;
    }

    const data = await res.json();
    if (!res.ok) throw data;
    return data as T;
}

export const http = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, {method: "POST", body: JSON.stringify(body)}),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, {method: "PUT", body: JSON.stringify(body)}),
    delete: <T>(path: string) => request<T>(path, {method: "DELETE"}),
};