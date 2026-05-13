import { act, renderHook } from "@testing-library/react";
import { useLogin, useLogout, usePasswordReset, useRegister } from "@/features/auth/hooks/useAuth";
import * as httpModule from "@/lib/http";
import * as authApiModule from "@/features/auth/api/authApi";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => ({ get: () => null }),
}));

jest.mock("@/lib/http", () => ({
    getToken: jest.fn(() => null),
    setToken: jest.fn(),
    setUserId: jest.fn(),
    removeToken: jest.fn(),
    removeUserId: jest.fn(),
    isAuthenticated: jest.fn(() => false),
    http: { post: jest.fn(), get: jest.fn() },
}));

jest.mock("@/features/auth/api/authApi", () => ({
    authApi: {
        login: jest.fn(),
        register: jest.fn(),
        requestPasswordReset: jest.fn(),
        confirmPasswordReset: jest.fn(),
    },
}));

const mockPayload = btoa(JSON.stringify({ sub: "user-123" }));
const mockToken = `header.${mockPayload}.signature`;

describe("useLogin", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls authApi.login with credentials", async () => {
        (authApiModule.authApi.login as jest.Mock).mockResolvedValue({
            token: mockToken,
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "Password123!");
        });
        expect(authApiModule.authApi.login).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "Password123!",
        });
    });

    it("sets loading during login", async () => {
        let resolve: (v: { token: string }) => void = () => {};
        (authApiModule.authApi.login as jest.Mock).mockReturnValue(
            new Promise((r) => {
                resolve = r;
            })
        );
        const { result } = renderHook(() => useLogin());
        act(() => {
            result.current.login("test@example.com", "Password123!");
        });
        expect(result.current.loading).toBe(true);
        await act(async () => {
            resolve({ token: mockToken });
        });
        expect(result.current.loading).toBe(false);
    });

    it("sets error on failure", async () => {
        (authApiModule.authApi.login as jest.Mock).mockRejectedValue({
            message: "Invalid credentials",
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "wrong");
        });
        expect(result.current.error?.message).toBe("Invalid credentials");
        expect(result.current.error?.locked).toBe(false);
    });

    it("sets locked=true when message contains locked", async () => {
        (authApiModule.authApi.login as jest.Mock).mockRejectedValue({
            message: "Account is temporarily locked",
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "wrong");
        });
        expect(result.current.error?.locked).toBe(true);
    });

    it("sets token and userId on success", async () => {
        (authApiModule.authApi.login as jest.Mock).mockResolvedValue({
            token: mockToken,
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "Password123!");
        });
        expect(httpModule.setToken).toHaveBeenCalledWith(mockToken);
        expect(httpModule.setUserId).toHaveBeenCalledWith("user-123");
    });
});

describe("useRegister", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls authApi.register with credentials", async () => {
        (authApiModule.authApi.register as jest.Mock).mockResolvedValue({
            userId: "u-1",
        });
        const { result } = renderHook(() => useRegister());
        await act(async () => {
            await result.current.register("test@example.com", "Password123!");
        });
        expect(authApiModule.authApi.register).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "Password123!",
        });
    });

    it("sets error on failure", async () => {
        (authApiModule.authApi.register as jest.Mock).mockRejectedValue({
            message: "Email already registered",
        });
        const { result } = renderHook(() => useRegister());
        await act(async () => {
            await result.current.register("test@example.com", "Password123!");
        });
        expect(result.current.error).toBe("Email already registered");
    });

    it("redirects to login with registered param", async () => {
        (authApiModule.authApi.register as jest.Mock).mockResolvedValue({ userId: "u-1" });
        const { result } = renderHook(() => useRegister());
        await act(async () => {
            await result.current.register("test@example.com", "Password123!");
        });
        expect(mockPush).toHaveBeenCalledWith("/login?registered=1");
    });
});

describe("usePasswordReset", () => {
    beforeEach(() => jest.clearAllMocks());

    it("moves to confirm step after successful request", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        const { result } = renderHook(() => usePasswordReset());
        expect(result.current.step).toBe("request");
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        expect(result.current.step).toBe("confirm");
    });

    it("moves to done step after successful confirm", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        (authApiModule.authApi.confirmPasswordReset as jest.Mock).mockResolvedValue(undefined);
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        await act(async () => {
            await result.current.confirmReset("user-id", "123456", "NewPassword123!");
        });
        expect(result.current.step).toBe("done");
    });

    it("backToRequest resets step and error", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        act(() => {
            result.current.backToRequest();
        });
        expect(result.current.step).toBe("request");
        expect(result.current.error).toBeNull();
    });

    it("sets error when confirmReset fails", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        (authApiModule.authApi.confirmPasswordReset as jest.Mock).mockRejectedValue({ message: "Invalid OTP" });
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        await act(async () => {
            await result.current.confirmReset("test@example.com", "123456", "NewPassword123!");
        });
        expect(result.current.error).toBe("Invalid OTP");
    });

    it("sets error when requestReset fails", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockRejectedValue({
            message: "Request failed server",
        });
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        expect(result.current.error).toBe("Request failed server");
    });
});

describe("useLogout", () => {
    it("removes token and userId", () => {
        const { result } = renderHook(() => useLogout());
        act(() => {
            result.current.logout();
        });
        expect(httpModule.removeToken).toHaveBeenCalled();
        expect(httpModule.removeUserId).toHaveBeenCalled();
    });
});

describe("extractUserId edge cases", () => {
    beforeEach(() => jest.clearAllMocks());

    it("handles token with non-extractable sub gracefully", async () => {
        const malformedPayload = btoa("not-json");
        const badToken = `header.${malformedPayload}.sig`;
        (authApiModule.authApi.login as jest.Mock).mockResolvedValue({
            token: badToken,
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "Password123!");
        });
        expect(httpModule.setToken).toHaveBeenCalledWith(badToken);
        expect(httpModule.setUserId).not.toHaveBeenCalled();
    });

    it("handles token with wrong number of parts", async () => {
        (authApiModule.authApi.login as jest.Mock).mockResolvedValue({
            token: "onlytwoparts.x",
        });
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "Password123!");
        });
        expect(httpModule.setUserId).not.toHaveBeenCalled();
    });
});

describe("useRegister redirect", () => {
    beforeEach(() => jest.clearAllMocks());

    it("redirects to login with registered param on success", async () => {
        (authApiModule.authApi.register as jest.Mock).mockResolvedValue({
            userId: "u-1",
        });
        const { result } = renderHook(() => useRegister());
        await act(async () => {
            await result.current.register("test@example.com", "Password123!");
        });
        expect(mockPush).toHaveBeenCalledWith("/login?registered=1");
    });
});

describe("usePasswordReset error handling", () => {
    beforeEach(() => jest.clearAllMocks());

    it("sets error when requestReset fails", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockRejectedValue({ message: "Email not found" });
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("unknown@example.com");
        });
        expect(result.current.error).toBe("Email not found");
        expect(result.current.step).toBe("request");
    });

    it("sets error when confirmReset fails", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        (authApiModule.authApi.confirmPasswordReset as jest.Mock).mockRejectedValue({ message: "Invalid OTP" });
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        await act(async () => {
            await result.current.confirmReset("test@example.com", "000000", "NewPassword123!");
        });
        expect(result.current.error).toBe("Invalid OTP");
        expect(result.current.step).toBe("confirm");
    });
});

describe("fallback error messages", () => {
    beforeEach(() => jest.clearAllMocks());

    it("useLogin uses fallback message when error has no message", async () => {
        (authApiModule.authApi.login as jest.Mock).mockRejectedValue({});
        const { result } = renderHook(() => useLogin());
        await act(async () => {
            await result.current.login("test@example.com", "Password123!");
        });
        expect(result.current.error?.message).toBe("Login failed");
    });

    it("useRegister uses fallback message when error has no message", async () => {
        (authApiModule.authApi.register as jest.Mock).mockRejectedValue({});
        const { result } = renderHook(() => useRegister());
        await act(async () => {
            await result.current.register("test@example.com", "Password123!");
        });
        expect(result.current.error).toBe("Registration failed");
    });

    it("usePasswordReset requestReset uses fallback message when error has no message", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockRejectedValue({});
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        expect(result.current.error).toBe("Request failed");
    });

    it("usePasswordReset confirmReset uses fallback message when error has no message", async () => {
        (authApiModule.authApi.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);
        (authApiModule.authApi.confirmPasswordReset as jest.Mock).mockRejectedValue({});
        const { result } = renderHook(() => usePasswordReset());
        await act(async () => {
            await result.current.requestReset("test@example.com");
        });
        await act(async () => {
            await result.current.confirmReset("test@example.com", "123456", "NewPassword123!");
        });
        expect(result.current.error).toBe("Reset failed");
    });
});
