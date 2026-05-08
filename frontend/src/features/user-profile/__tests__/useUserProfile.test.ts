import { renderHook, act } from "@testing-library/react";
import { useUpdatePreferences } from "@/features/user-profile/hooks/useUserProfile";
import * as apiModule from "@/features/user-profile/api/userProfileApi";

jest.mock("swr", () => ({
    __esModule: true,
    default: jest.fn(() => ({
        data: {
            id: "user-123",
            firstName: "John",
            lastName: "Doe",
            displayName: "johndoe",
            preferredCurrency: "EUR",
            birthDate: null,
        },
        error: null,
        isLoading: false,
        mutate: jest.fn(),
    })),
}));

jest.mock("@/features/user-profile/api/userProfileApi", () => ({
    userProfileApi: {
        getMe: jest.fn(),
        updatePreferences: jest.fn(),
    },
}));

const mockPreferences = {
    firstName: "John",
    lastName: "Doe",
    displayName: "johndoe",
    preferredCurrency: "EUR",
    birthDate: null,
};

describe("useUpdatePreferences", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls updatePreferences with data", async () => {
        (apiModule.userProfileApi.updatePreferences as jest.Mock).mockResolvedValue(mockPreferences);
        const { result } = renderHook(() => useUpdatePreferences());
        await act(async () => {
            await result.current.update(mockPreferences);
        });
        expect(apiModule.userProfileApi.updatePreferences).toHaveBeenCalledWith(mockPreferences);
    });

    it("sets success on successful update", async () => {
        (apiModule.userProfileApi.updatePreferences as jest.Mock).mockResolvedValue(mockPreferences);
        const { result } = renderHook(() => useUpdatePreferences());
        await act(async () => {
            await result.current.update(mockPreferences);
        });
        expect(result.current.success).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it("sets error on failed update", async () => {
        (apiModule.userProfileApi.updatePreferences as jest.Mock).mockRejectedValue({
            message: "Validation failed",
        });
        const { result } = renderHook(() => useUpdatePreferences());
        await act(async () => {
            await result.current.update(mockPreferences);
        });
        expect(result.current.error).toBe("Validation failed");
        expect(result.current.success).toBe(false);
    });

    it("sets loading during update", async () => {
        let resolve: (v: unknown) => void = () => {};
        (apiModule.userProfileApi.updatePreferences as jest.Mock).mockReturnValue(
            new Promise(r => { resolve = r; })
        );
        const { result } = renderHook(() => useUpdatePreferences());
        act(() => { result.current.update(mockPreferences); });
        expect(result.current.loading).toBe(true);
        await act(async () => { resolve(mockPreferences); });
        expect(result.current.loading).toBe(false);
    });

    it("calls onSuccess callback after update", async () => {
        (apiModule.userProfileApi.updatePreferences as jest.Mock).mockResolvedValue(mockPreferences);
        const onSuccess = jest.fn();
        const { result } = renderHook(() => useUpdatePreferences());
        await act(async () => {
            await result.current.update(mockPreferences, onSuccess);
        });
        expect(onSuccess).toHaveBeenCalled();
    });
});