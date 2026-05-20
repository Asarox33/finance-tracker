import { renderHook } from "@testing-library/react";
import { useFees } from "@/features/fees/hooks/useFees";
import * as apiModule from "@/features/fees/api/feesApi";

jest.mock("@/features/fees/api/feesApi", () => ({
    feesApi: {
        list: jest.fn(),
        record: jest.fn(),
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

describe("useFees", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls feesApi.list with accountId and default page", () => {
        (apiModule.feesApi.list as jest.Mock).mockResolvedValue({ items: [] });
        renderHook(() => useFees("acc-1"));
        expect(apiModule.feesApi.list).toHaveBeenCalledWith("acc-1", 0, 20);
    });

    it("calls feesApi.list with provided page and pageSize", () => {
        (apiModule.feesApi.list as jest.Mock).mockResolvedValue({ items: [] });
        renderHook(() => useFees("acc-1", 2, 50));
        expect(apiModule.feesApi.list).toHaveBeenCalledWith("acc-1", 2, 50);
    });

    it("does not call feesApi.list when accountId is empty", () => {
        renderHook(() => useFees(""));
        expect(apiModule.feesApi.list).not.toHaveBeenCalled();
    });
});
