import { renderHook } from "@testing-library/react";
import { useInstitutionSearch } from "@/features/institutions/hooks/useInstitutionSearch";
import * as apiModule from "@/features/institutions/api/institutionsApi";
import useSWR from "swr";

jest.mock("@/features/institutions/api/institutionsApi", () => ({
    institutionsApi: {
        list: jest.fn(),
    },
}));

jest.mock("@/shared/hooks/useDebouncedValue", () => ({
    useDebouncedValue: (value: string) => value,
}));

jest.mock("swr", () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockPageResult = {
    items: [{ id: "inst-1", name: "BNP Paribas", country: "FR", type: "BANK", bic: null }],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe("useInstitutionSearch", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSWR.mockImplementation((key, fetcher) => {
            if (!key || !fetcher) {
                return {
                    data: undefined,
                    error: undefined,
                    isLoading: false,
                    mutate: jest.fn(),
                };
            }
            return {
                data: mockPageResult,
                error: undefined,
                isLoading: false,
                mutate: jest.fn(),
            };
        });
    });

    it("does not call list when query is shorter than 3 characters", () => {
        renderHook(() => useInstitutionSearch("BN"));
        expect(apiModule.institutionsApi.list).not.toHaveBeenCalled();
    });

    it("calls list with debounced query when length is at least 3", () => {
        (apiModule.institutionsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useInstitutionSearch("BNP"));
        expect(mockUseSWR).toHaveBeenCalledWith(["institution-search", "BNP"], expect.any(Function));
    });

    it("trims query before search", () => {
        renderHook(() => useInstitutionSearch("  BNP  "));
        expect(mockUseSWR).toHaveBeenCalledWith(["institution-search", "BNP"], expect.any(Function));
    });

    it("returns institutions and totalItems from SWR data", () => {
        const { result } = renderHook(() => useInstitutionSearch("BNP"));
        expect(result.current.institutions).toEqual(mockPageResult.items);
        expect(result.current.totalItems).toBe(1);
        expect(result.current.canSearch).toBe(true);
    });

    it("fetcher calls institutionsApi.list with page size and query", async () => {
        let fetcher: (() => Promise<unknown>) | undefined;
        (apiModule.institutionsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        mockUseSWR.mockImplementation((key, fn) => {
            fetcher = fn as typeof fetcher;
            return {
                data: undefined,
                error: undefined,
                isLoading: true,
                mutate: jest.fn(),
            };
        });

        renderHook(() => useInstitutionSearch("BNP"));
        await fetcher?.();

        expect(apiModule.institutionsApi.list).toHaveBeenCalledWith(0, 20, "BNP");
    });

    it("returns empty defaults when SWR has no data yet", () => {
        mockUseSWR.mockImplementation((key) => {
            if (!key) {
                return {
                    data: undefined,
                    error: undefined,
                    isLoading: false,
                    mutate: jest.fn(),
                };
            }
            return {
                data: undefined,
                error: undefined,
                isLoading: true,
                mutate: jest.fn(),
            };
        });

        const { result } = renderHook(() => useInstitutionSearch("BNP"));
        expect(result.current.institutions).toEqual([]);
        expect(result.current.totalItems).toBe(0);
        expect(result.current.isLoading).toBe(true);
    });
});
