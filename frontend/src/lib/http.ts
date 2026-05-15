import { redirectToLogin } from "@/lib/navigation";

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

function readStoredAccessToken(): string | null {
    /* istanbul ignore next */
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("auth_token");
    } catch {
        return null;
    }
}

/**
 * Returns the access JWT only if present and not expired.
 * Expired tokens may remain in storage until refresh succeeds or the user logs out.
 */
export function getToken(): string | null {
    const token = readStoredAccessToken();
    if (!token) return null;
    if (isTokenExpired(token)) return null;
    return token;
}

export function getAccessTokenExpiryMs(): number | null {
    const raw = readStoredAccessToken();
    if (!raw) return null;
    try {
        const payload = JSON.parse(atob(raw.split(".")[1]));
        if (!payload.exp || typeof payload.exp !== "number") return null;
        return payload.exp * 1000;
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
    const token = readStoredAccessToken();
    return !!token && !isTokenExpired(token);
}

let refreshInFlight: Promise<boolean> | null = null;

async function doRefreshAccessToken(): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken?: string };
        if (!data.accessToken) return false;
        setToken(data.accessToken);
        return true;
    } catch {
        return false;
    }
}

export function refreshAccessToken(): Promise<boolean> {
    if (!refreshInFlight) {
        refreshInFlight = (async () => {
            try {
                return await doRefreshAccessToken();
            } finally {
                refreshInFlight = null;
            }
        })();
    }
    return refreshInFlight;
}

export async function ensureSession(): Promise<boolean> {
    const token = readStoredAccessToken();
    if (token && !isTokenExpired(token)) return true;
    return refreshAccessToken();
}

function shouldPrefetchSession(path: string): boolean {
    return (
        !path.startsWith("/auth/login") &&
        !path.startsWith("/auth/register") &&
        !path.startsWith("/auth/password-reset") &&
        !path.startsWith("/auth/refresh")
    );
}

function clearSessionAndRedirectToLogin(): void {
    removeToken();
    removeUserId();
    redirectToLogin();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (shouldPrefetchSession(path)) {
        await ensureSession();
    }

    let token = getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const execFetch = () =>
        fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
            credentials: "include",
        });

    let res = await execFetch();

    if (res.status === 401 && !path.startsWith("/auth/")) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            token = getToken();
            const retryHeaders = { ...headers };
            if (token) retryHeaders["Authorization"] = `Bearer ${token}`;
            else delete retryHeaders["Authorization"];
            res = await fetch(`${BASE_URL}${path}`, {
                ...options,
                headers: retryHeaders,
                credentials: "include",
            });
        }
        if (res.status === 401) {
            clearSessionAndRedirectToLogin();
            throw new Error("Unauthorized");
        }
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
    post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
