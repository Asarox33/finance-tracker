import { renderHook } from "@testing-library/react";
import { useReferenceCurrency } from "@/shared/hooks/useReferenceCurrency";
import * as profileModule from "@/features/user-profile/hooks/useUserProfile";

jest.mock("@/features/user-profile/hooks/useUserProfile");

describe("useReferenceCurrency", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns preferredCurrency from profile", () => {
        (profileModule.useUserProfile as jest.Mock).mockReturnValue({
            profile: { preferredCurrency: "USD" },
            isLoading: false,
        });
        const { result } = renderHook(() => useReferenceCurrency());
        expect(result.current.referenceCurrency).toBe("USD");
        expect(result.current.isLoading).toBe(false);
    });

    it("falls back to EUR when profile is missing", () => {
        (profileModule.useUserProfile as jest.Mock).mockReturnValue({
            profile: undefined,
            isLoading: false,
        });
        const { result } = renderHook(() => useReferenceCurrency());
        expect(result.current.referenceCurrency).toBe("EUR");
    });

    it("exposes profile loading state", () => {
        (profileModule.useUserProfile as jest.Mock).mockReturnValue({
            profile: undefined,
            isLoading: true,
        });
        const { result } = renderHook(() => useReferenceCurrency());
        expect(result.current.isLoading).toBe(true);
    });
});
