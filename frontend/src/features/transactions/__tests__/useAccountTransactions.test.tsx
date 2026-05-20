import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { useAccountTransactions } from "@/features/transactions/hooks/useTransactions";
import { transactionsApi } from "@/features/transactions/api/transactionsApi";

jest.mock("@/features/transactions/api/transactionsApi", () => ({
    transactionsApi: {
        list: jest.fn(),
    },
}));

const emptyPage = {
    totalPages: 1,
    page: 0,
    pageSize: 1,
    isEmpty: true,
    isFirst: true,
    isLast: true,
};

const mockTx = {
    id: "tx-1",
    accountId: "acc-1",
    assetId: null,
    type: "DEPOSIT",
    amount: 100,
    currency: "EUR",
    date: "2024-01-15",
    label: "A",
    notes: null,
    appliedFxRate: null,
    appliedFxRateScale: null,
    appliedFxRateDate: null,
    appliedFxSourceCurrency: null,
    appliedFxTargetCurrency: null,
    assetQuantityMinor: null,
    assetQuantityScale: null,
};

function wrapper({ children }: { children: ReactNode }) {
    return <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>;
}

describe("useAccountTransactions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("does not call list when accountId is empty", () => {
        const { result } = renderHook(() => useAccountTransactions(""), { wrapper });
        expect(transactionsApi.list).not.toHaveBeenCalled();
        expect(result.current.transactions).toEqual([]);
        expect(result.current.totalItems).toBe(0);
    });

    it("returns probe only when totalItems is 0", async () => {
        (transactionsApi.list as jest.Mock).mockResolvedValueOnce({
            items: [],
            totalItems: 0,
            ...emptyPage,
        });

        const { result } = renderHook(() => useAccountTransactions("acc-1"), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(transactionsApi.list).toHaveBeenCalledTimes(1);
        expect(transactionsApi.list).toHaveBeenCalledWith("acc-1", 0, 1, undefined, undefined);
        expect(result.current.transactions).toEqual([]);
        expect(result.current.totalItems).toBe(0);
    });

    it("returns probe only when totalItems is 1", async () => {
        (transactionsApi.list as jest.Mock).mockResolvedValueOnce({
            items: [mockTx],
            totalItems: 1,
            totalPages: 1,
            page: 0,
            pageSize: 1,
            isEmpty: false,
            isFirst: true,
            isLast: true,
        });

        const { result } = renderHook(() => useAccountTransactions("acc-1"), { wrapper });

        await waitFor(() => expect(result.current.totalItems).toBe(1));
        expect(transactionsApi.list).toHaveBeenCalledTimes(1);
        expect(result.current.transactions).toHaveLength(1);
        expect(result.current.transactions[0]?.id).toBe("tx-1");
    });

    it("fetches full list when totalItems is greater than 1", async () => {
        const t2 = { ...mockTx, id: "tx-2" };
        const t3 = { ...mockTx, id: "tx-3" };
        (transactionsApi.list as jest.Mock)
            .mockResolvedValueOnce({
                items: [mockTx],
                totalItems: 3,
                totalPages: 3,
                page: 0,
                pageSize: 1,
                isEmpty: false,
                isFirst: true,
                isLast: false,
            })
            .mockResolvedValueOnce({
                items: [mockTx, t2, t3],
                totalItems: 3,
                totalPages: 1,
                page: 0,
                pageSize: 3,
                isEmpty: false,
                isFirst: true,
                isLast: true,
            });

        const { result } = renderHook(() => useAccountTransactions("acc-1"), { wrapper });

        await waitFor(() => expect(result.current.transactions).toHaveLength(3));
        expect(transactionsApi.list).toHaveBeenCalledTimes(2);
        expect(transactionsApi.list).toHaveBeenNthCalledWith(1, "acc-1", 0, 1, undefined, undefined);
        expect(transactionsApi.list).toHaveBeenNthCalledWith(2, "acc-1", 0, 3, undefined, undefined);
    });

    it("passes date filters to list", async () => {
        (transactionsApi.list as jest.Mock).mockResolvedValueOnce({
            items: [mockTx],
            totalItems: 1,
            totalPages: 1,
            page: 0,
            pageSize: 1,
            isEmpty: false,
            isFirst: true,
            isLast: true,
        });

        const { result } = renderHook(() => useAccountTransactions("acc-1", "2024-01-01", "2024-01-31"), {
            wrapper,
        });

        await waitFor(() => expect(result.current.totalItems).toBe(1));
        expect(transactionsApi.list).toHaveBeenCalledWith("acc-1", 0, 1, "2024-01-01", "2024-01-31");
    });
});
