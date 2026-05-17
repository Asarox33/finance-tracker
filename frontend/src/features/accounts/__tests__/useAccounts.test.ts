import { renderHook } from "@testing-library/react";
import { useAccount, useAccounts } from "@/features/accounts/hooks/useAccounts";
import * as apiModule from "@/features/accounts/api/accountsApi";

jest.mock("@/features/accounts/api/accountsApi", () => ({
    accountsApi: {
        list: jest.fn(),
        get: jest.fn(),
        reactivate: jest.fn(),
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

const mockAccount = {
    id: "acc-1",
    userId: "user-1",
    institutionId: "inst-1",
    name: "Main Checking",
    type: "CHECKING",
    currency: "EUR",
    status: "ACTIVE",
};

const mockPageResult = {
    items: [mockAccount],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

describe("useAccounts", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls accountsApi.list with default page", () => {
        (apiModule.accountsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAccounts());
        expect(apiModule.accountsApi.list).toHaveBeenCalledWith(0, 20, true, undefined);
    });

    it("calls accountsApi.list with provided page", () => {
        (apiModule.accountsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAccounts(2));
        expect(apiModule.accountsApi.list).toHaveBeenCalledWith(2, 20, true, undefined);
    });

    it("calls accountsApi.list with includeClosed flag", () => {
        (apiModule.accountsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAccounts(0, false));
        expect(apiModule.accountsApi.list).toHaveBeenCalledWith(0, 20, false, undefined);
    });

    it("calls accountsApi.list with type filter", () => {
        (apiModule.accountsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useAccounts(0, true, "SAVINGS"));
        expect(apiModule.accountsApi.list).toHaveBeenCalledWith(0, 20, true, "SAVINGS");
    });
});

describe("useAccount", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls accountsApi.get with id when id is provided", () => {
        (apiModule.accountsApi.get as jest.Mock).mockResolvedValue(mockAccount);
        renderHook(() => useAccount("acc-1"));
        expect(apiModule.accountsApi.get).toHaveBeenCalledWith("acc-1");
    });

    it("does not call accountsApi.get when id is empty", () => {
        renderHook(() => useAccount(""));
        expect(apiModule.accountsApi.get).not.toHaveBeenCalled();
    });
});
