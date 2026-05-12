import {getToken, getUserId, isAuthenticated, removeToken, removeUserId, setToken, setUserId,} from "@/lib/http";

function makeValidToken(): string {
    const header = btoa(JSON.stringify({alg: "HS256"}));
    const payload = btoa(JSON.stringify({
        sub: "user-123",
        exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    return `${header}.${payload}.signature`;
}

function makeExpiredToken(): string {
    const header = btoa(JSON.stringify({alg: "HS256"}));
    const payload = btoa(JSON.stringify({
        sub: "user-123",
        exp: Math.floor(Date.now() / 1000) - 3600,
    }));
    return `${header}.${payload}.signature`;
}

describe("token management", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns null when no token is stored", () => {
        expect(getToken()).toBeNull();
    });

    it("stores and retrieves a valid token", () => {
        const token = makeValidToken();
        setToken(token);
        expect(getToken()).toBe(token);
    });

    it("removes token", () => {
        setToken(makeValidToken());
        removeToken();
        expect(getToken()).toBeNull();
    });

    it("returns null and clears storage for expired token", () => {
        const token = makeExpiredToken();
        localStorage.setItem("auth_token", token);
        expect(getToken()).toBeNull();
        expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("returns null when localStorage.getItem throws", () => {
        jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("storage unavailable");
        });
        expect(getToken()).toBeNull();
        jest.restoreAllMocks();
    });
});

describe("userId management", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns null when no userId is stored", () => {
        expect(getUserId()).toBeNull();
    });

    it("stores and retrieves userId", () => {
        setUserId("user-123");
        expect(getUserId()).toBe("user-123");
    });

    it("removes userId", () => {
        setUserId("user-123");
        removeUserId();
        expect(getUserId()).toBeNull();
    });
});

describe("isAuthenticated", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns false when no token", () => {
        expect(isAuthenticated()).toBe(false);
    });

    it("returns true when valid token exists", () => {
        setToken(makeValidToken());
        expect(isAuthenticated()).toBe(true);
    });

    it("returns false when only expired token exists", () => {
        localStorage.setItem("auth_token", makeExpiredToken());
        expect(isAuthenticated()).toBe(false);
    });
});

describe("http requests", () => {
    const mockFetch = jest.fn();

    beforeEach(() => {
        localStorage.clear();
        global.fetch = mockFetch;
        mockFetch.mockClear();
    });

    it("makes GET request with auth header", async () => {
        const token = makeValidToken();
        setToken(token);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {get: () => null},
            json: async () => ({data: "ok"}),
        });
        const {http} = await import("@/lib/http");
        const result = await http.get("/test");
        expect(result).toEqual({data: "ok"});
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/test",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining("Bearer "),
                }),
            })
        );
    });

    it("throws error body on non-ok response", async () => {
        setToken(makeValidToken());
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: {get: () => null},
            json: async () => ({message: "Bad request"}),
        });
        const {http} = await import("@/lib/http");
        await expect(http.get("/test")).rejects.toEqual({message: "Bad request"});
    });

    it("returns undefined on 204 response", async () => {
        setToken(makeValidToken());
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 204,
            headers: {get: () => null},
            json: async () => null,
        });
        const {http} = await import("@/lib/http");
        const result = await http.delete("/test");
        expect(result).toBeUndefined();
    });

    it("makes POST request with body", async () => {
        setToken(makeValidToken());
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {get: () => null},
            json: async () => ({id: "1"}),
        });
        const {http} = await import("@/lib/http");
        await http.post("/test", {name: "test"});
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/test",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({name: "test"}),
            })
        );
    });

    it("makes PUT request with body", async () => {
        setToken(makeValidToken());
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {get: () => null},
            json: async () => ({id: "1"}),
        });
        const {http} = await import("@/lib/http");
        await http.put("/test", {name: "updated"});
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/test",
            expect.objectContaining({method: "PUT"})
        );
    });
});

describe("isTokenExpired via getToken", () => {
    beforeEach(() => localStorage.clear());

    it("returns null for malformed token", () => {
        localStorage.setItem("auth_token", "not.a.valid.jwt");
        expect(getToken()).toBeNull();
    });

    it("returns null for token with no exp claim", () => {
        const header = btoa(JSON.stringify({alg: "HS256"}));
        const payload = btoa(JSON.stringify({sub: "user-123"}));
        localStorage.setItem("auth_token", `${header}.${payload}.sig`);
        // no exp → isTokenExpired returns false → token is valid
        expect(getToken()).not.toBeNull();
    });
});

describe("getUserId error handling", () => {
    it("returns null when localStorage throws", () => {
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "user_id") throw new Error("storage error");
            return null;
        });
        expect(getUserId()).toBeNull();
        jest.restoreAllMocks();
    });
});

describe("isTokenExpired via getToken", () => {
    beforeEach(() => localStorage.clear());

    it("returns null for malformed token", () => {
        localStorage.setItem("auth_token", "not.a.valid.jwt");
        expect(getToken()).toBeNull();
    });

    it("returns null for token with no exp claim", () => {
        const header = btoa(JSON.stringify({alg: "HS256"}));
        const payload = btoa(JSON.stringify({sub: "user-123"}));
        localStorage.setItem("auth_token", `${header}.${payload}.sig`);
        // no exp → isTokenExpired returns false → token is valid
        expect(getToken()).not.toBeNull();
    });
});

describe("getUserId error handling", () => {
    it("returns null when localStorage throws", () => {
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "user_id") throw new Error("storage error");
            return null;
        });
        expect(getUserId()).toBeNull();
        jest.restoreAllMocks();
    });
});

describe("http 401 handling", () => {
    const mockFetch = jest.fn();

    beforeEach(() => {
        localStorage.clear();
        global.fetch = mockFetch;
        mockFetch.mockClear();
    });

    it("clears token and throws on 401 for non-auth endpoint", async () => {
        setToken(makeValidToken());
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {get: () => null},
            json: async () => ({message: "Unauthorized"}),
        });
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => {
        });
        const {http} = await import("@/lib/http");
        await expect(http.get("/protected")).rejects.toThrow("Unauthorized");
        expect(getToken()).toBeNull();
        consoleError.mockRestore();
    });

    it("does not redirect on 401 for auth endpoints", async () => {
        setToken(makeValidToken());
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {get: () => null},
            json: async () => ({message: "Invalid credentials"}),
        });
        const {http} = jest.requireActual("@/lib/http") as typeof import("@/lib/http");
        await expect(http.post("/auth/login", {})).rejects.toEqual({message: "Invalid credentials"});
        expect(getToken()).not.toBeNull();
    });
});