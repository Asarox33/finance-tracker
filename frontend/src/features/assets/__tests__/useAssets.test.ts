import { renderHook } from "@testing-library/react";
import { useAsset, useAssets } from "@/features/assets/hooks/useAssets";
import * as apiModule from "@/features/assets/api/assetsApi";

jest.mock("@/features/assets/api/assetsApi", () => ({
    assetsApi: {
        list: jest.fn(),
        get: jest.fn(),
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
                mutate: jest.fn(),
            };
        try {
            fetcher();
        } catch {}
        return {
            data: undefined,
            error: undefined,
            isLoading: false,
            mutate: jest.fn(),
        };
    }),
}));

const mockPageResult = {
    items: [
        {
            id: "asset-1",
            name: "Apple Inc.",
            type: "STOCK",
            currency: "USD",
            isin: "US0378331005",
            ticker: "AAPL",
            createdByUserId: "user-123",
        },
    ],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

describe("useAssets", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls assetsApi.list with default params", () => {
        (apiModule.assetsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAssets());
        expect(apiModule.assetsApi.list).toHaveBeenCalledWith(0, 20);
    });

    it("calls assetsApi.list with page param", () => {
        (apiModule.assetsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAssets(2));
        expect(apiModule.assetsApi.list).toHaveBeenCalledWith(2, 20);
    });

    it("calls assetsApi.list with custom pageSize", () => {
        (apiModule.assetsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAssets(0, 50));
        expect(apiModule.assetsApi.list).toHaveBeenCalledWith(0, 50);
    });
});

describe("useAsset", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls assetsApi.get when id is provided", () => {
        (apiModule.assetsApi.get as jest.Mock).mockResolvedValue(mockPageResult.items[0]);
        renderHook(() => useAsset("asset-1"));
        expect(apiModule.assetsApi.get).toHaveBeenCalledWith("asset-1");
    });

    it("does not call assetsApi.get when id is empty", () => {
        renderHook(() => useAsset(""));
        expect(apiModule.assetsApi.get).not.toHaveBeenCalled();
    });
});
