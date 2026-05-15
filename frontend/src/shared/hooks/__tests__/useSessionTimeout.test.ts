import { act, renderHook } from "@testing-library/react";

import { useSessionTimeout } from "@/shared/hooks/useSessionTimeout";
import * as httpModule from "@/lib/http";

const mockLogout = jest.fn();

jest.mock("@/features/auth/hooks/useAuth", () => ({
    useLogout: () => ({ logout: mockLogout }),
}));

jest.mock("@/lib/http", () => {
    const actual = jest.requireActual<typeof httpModule>("@/lib/http");
    return {
        ...actual,
        getAccessTokenExpiryMs: jest.fn(),
        getToken: jest.fn(),
        refreshAccessToken: jest.fn(),
        subscribeAccessTokenChange: jest.fn(() => () => {}),
    };
});

function makeExpMs(offsetMs: number): number {
    return Date.now() + offsetMs;
}

describe("useSessionTimeout", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockLogout.mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("proactively refreshes when token is within refresh-ahead window", async () => {
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(makeExpMs(90_000));
        (httpModule.refreshAccessToken as jest.Mock).mockImplementation(async () => {
            (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(makeExpMs(600_000));
            return true;
        });

        const { result } = renderHook(() => useSessionTimeout());

        await act(async () => {
            await Promise.resolve();
        });

        expect(httpModule.refreshAccessToken).toHaveBeenCalled();
        expect(result.current.warningOpen).toBe(false);
    });

    it("opens jwt modal when proactive refresh fails near expiry", async () => {
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(makeExpMs(10_000));
        (httpModule.refreshAccessToken as jest.Mock).mockResolvedValue(false);

        const { result } = renderHook(() => useSessionTimeout());

        await act(async () => {
            await Promise.resolve();
        });

        expect(httpModule.refreshAccessToken).toHaveBeenCalled();
        expect(result.current.warningOpen).toBe(true);
        expect(result.current.reason).toBe("jwt");
    });

    it("refreshes at jwt warning time instead of opening modal when refresh succeeds", async () => {
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(makeExpMs(20_000));
        (httpModule.refreshAccessToken as jest.Mock).mockImplementation(async () => {
            (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(makeExpMs(600_000));
            return true;
        });

        const { result } = renderHook(() => useSessionTimeout());

        await act(async () => {
            await Promise.resolve();
        });

        expect(httpModule.refreshAccessToken).toHaveBeenCalled();
        expect(result.current.warningOpen).toBe(false);
    });

    it("opens jwt modal when imminent refresh fails", async () => {
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(makeExpMs(20_000));
        (httpModule.refreshAccessToken as jest.Mock).mockResolvedValue(false);

        const { result } = renderHook(() => useSessionTimeout());

        await act(async () => {
            jest.advanceTimersByTime(5_000);
            await Promise.resolve();
        });

        expect(result.current.warningOpen).toBe(true);
        expect(result.current.reason).toBe("jwt");
    });

    it("does not logout after grace when token has comfortable lifetime", async () => {
        const expNear = makeExpMs(10_000);
        const expFar = makeExpMs(600_000);
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(expNear);
        (httpModule.refreshAccessToken as jest.Mock).mockResolvedValue(false);
        (httpModule.getToken as jest.Mock).mockReturnValue(null);

        const { result } = renderHook(() => useSessionTimeout());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.warningOpen).toBe(true);

        (httpModule.getToken as jest.Mock).mockReturnValue("valid-token");
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(expFar);

        await act(async () => {
            jest.advanceTimersByTime(15_000);
            await Promise.resolve();
        });

        expect(mockLogout).not.toHaveBeenCalled();
        expect(result.current.warningOpen).toBe(false);
    });

    it("dismisses open modal when access token subscriber reports comfortable lifetime", async () => {
        const expNear = makeExpMs(10_000);
        const expFar = makeExpMs(600_000);
        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(expNear);
        (httpModule.refreshAccessToken as jest.Mock).mockResolvedValue(false);

        let tokenListener: (() => void) | undefined;
        (httpModule.subscribeAccessTokenChange as jest.Mock).mockImplementation((listener: () => void) => {
            tokenListener = listener;
            return () => {};
        });

        const { result } = renderHook(() => useSessionTimeout());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.warningOpen).toBe(true);

        (httpModule.getAccessTokenExpiryMs as jest.Mock).mockReturnValue(expFar);
        (httpModule.getToken as jest.Mock).mockReturnValue("valid-token");

        await act(async () => {
            tokenListener?.();
            await Promise.resolve();
        });

        expect(result.current.warningOpen).toBe(false);
    });
});
