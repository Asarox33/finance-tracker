import { renderHook } from "@testing-library/react";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import * as apiModule from "@/features/transactions/api/transactionsApi";

jest.mock("@/features/transactions/api/transactionsApi", () => ({
    transactionsApi: {
        list: jest.fn(),
    },
}));

jest.mock("swr", () => ({
    __esModule: true,
    default: jest.fn((key: unknown, fetcher: (() => unknown) | null) => {
        if (!key || !fetcher) return { data: undefined, error: undefined, isLoading: false, mutate: jest.fn() };
        try { fetcher(); } catch {}
        return { data: undefined, error: undefined, isLoading: false, mutate: jest.fn() };
    }),
}));

describe("useTransactions", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls transactionsApi.list with accountId and default page", () => {
        (apiModule.transactionsApi.list as jest.Mock).mockResolvedValue({ items: [] });
        renderHook(() => useTransactions("acc-1"));
        expect(apiModule.transactionsApi.list).toHaveBeenCalledWith("acc-1", 0, 20, undefined, undefined);
    });

    it("calls transactionsApi.list with provided page", () => {
        (apiModule.transactionsApi.list as jest.Mock).mockResolvedValue({ items: [] });
        renderHook(() => useTransactions("acc-1", 2));
        expect(apiModule.transactionsApi.list).toHaveBeenCalledWith("acc-1", 2, 20, undefined, undefined);
    });

    it("calls transactionsApi.list with date range", () => {
        (apiModule.transactionsApi.list as jest.Mock).mockResolvedValue({ items: [] });
        renderHook(() => useTransactions("acc-1", 0, "2024-01-01", "2024-12-31"));
        expect(apiModule.transactionsApi.list).toHaveBeenCalledWith("acc-1", 0, 20, "2024-01-01", "2024-12-31");
    });

    it("does not call transactionsApi.list when accountId is empty", () => {
        renderHook(() => useTransactions(""));
        expect(apiModule.transactionsApi.list).not.toHaveBeenCalled();
    });
});