import { renderHook } from "@testing-library/react";
import { useAssetSearch } from "@/features/assets/hooks/useAssetSearch";
import * as apiModule from "@/features/assets/api/assetsApi";

jest.mock("@/features/assets/api/assetsApi", () => ({
    assetsApi: {
        list: jest.fn(),
    },
}));

jest.mock("swr", () => ({
    __esModule: true,
    default: jest.fn((key: unknown, fetcher: (() => unknown) | null) => {
        if (!key || !fetcher)
            return {
                data: undefined,
                error: undefined,
                isLoading: false,
            };
        try {
            fetcher();
        } catch {}
        return {
            data: undefined,
            error: undefined,
            isLoading: false,
        };
    }),
}));

describe("useAssetSearch", () => {
    beforeEach(() => jest.clearAllMocks());

    it("does not call assetsApi.list when query is too short", () => {
        renderHook(() => useAssetSearch("AP"));
        expect(apiModule.assetsApi.list).not.toHaveBeenCalled();
    });

    it("calls assetsApi.list when query has at least 3 characters", () => {
        (apiModule.assetsApi.list as jest.Mock).mockResolvedValue({ items: [], totalItems: 0 });
        renderHook(() => useAssetSearch("Apple"));
        expect(apiModule.assetsApi.list).toHaveBeenCalledWith(0, 20, "Apple");
    });
});
