import { authApi } from "@/features/auth/api/authApi";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: () => null },
        json: async () => body,
    });
}

function makeValidToken(): string {
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(
        JSON.stringify({
            sub: "user-123",
            exp: Math.floor(Date.now() / 1000) + 3600,
        })
    );
    return `${header}.${payload}.signature`;
}

describe("authApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("calls login endpoint with credentials", async () => {
        const token = makeValidToken();
        mockResponse({ accessToken: token });
        const result = await authApi.login({
            email: "test@example.com",
            password: "Password123!",
        });
        expect(result.accessToken).toBe(token);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/login"),
            expect.objectContaining({ method: "POST", credentials: "include" })
        );
    });

    it("sends correct body on login", async () => {
        mockResponse({ accessToken: makeValidToken() });
        await authApi.login({
            email: "test@example.com",
            password: "Password123!",
        });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.email).toBe("test@example.com");
        expect(body.password).toBe("Password123!");
    });

    it("calls register endpoint with credentials", async () => {
        mockResponse({ userId: "user-123" }, 201);
        const result = await authApi.register({
            email: "new@example.com",
            password: "Password123!",
            preferredLanguage: "FRA",
        });
        expect(result.userId).toBe("user-123");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/register"),
            expect.objectContaining({ method: "POST" })
        );
    });

    it("sends preferred language on register", async () => {
        mockResponse({ userId: "user-123" }, 201);
        await authApi.register({
            email: "new@example.com",
            password: "Password123!",
            preferredLanguage: "ITA",
        });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.preferredLanguage).toBe("ITA");
    });

    it("calls password reset request endpoint", async () => {
        mockResponse(null, 204);
        await authApi.requestPasswordReset({ email: "test@example.com" });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/password-reset/request"),
            expect.objectContaining({ method: "POST" })
        );
    });

    it("calls password reset confirm endpoint", async () => {
        mockResponse(null, 204);
        await authApi.confirmPasswordReset({
            email: "test@example.com",
            otp: "123456",
            newPassword: "NewPassword123!",
        });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/password-reset/confirm"),
            expect.objectContaining({ method: "POST" })
        );
    });

    it("sends correct body on password reset confirm", async () => {
        mockResponse(null, 204);
        await authApi.confirmPasswordReset({
            email: "test@example.com",
            otp: "123456",
            newPassword: "NewPassword123!",
        });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.email).toBe("test@example.com");
        expect(body.otp).toBe("123456");
        expect(body.newPassword).toBe("NewPassword123!");
    });
});
