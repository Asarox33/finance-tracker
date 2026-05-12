import {renderHook} from "@testing-library/react";
import {useInstitution, useInstitutions} from "@/features/institutions/hooks/useInstitutions";
import * as apiModule from "@/features/institutions/api/institutionsApi";

jest.mock("@/features/institutions/api/institutionsApi", () => ({
    institutionsApi: {
        list: jest.fn(),
        get: jest.fn(),
    },
}));

jest.mock("swr", () => ({
    __esModule: true,
    default: jest.fn((key: unknown, fetcher: (() => unknown) | null) => {
        if (!key || !fetcher) return {data: undefined, error: undefined, isLoading: false, mutate: jest.fn()};
        try {
            fetcher();
        } catch {
        }
        return {data: undefined, error: undefined, isLoading: false, mutate: jest.fn()};
    }),
}));

const mockPageResult = {
    items: [{id: "inst-1", name: "BNP Paribas", country: "FR", bic: "BNPAFRPP"}],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

describe("useInstitutions", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls institutionsApi.list with default params", () => {
        (apiModule.institutionsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useInstitutions());
        expect(apiModule.institutionsApi.list).toHaveBeenCalledWith(0, 20, undefined, undefined);
    });

    it("calls institutionsApi.list with name filter", () => {
        (apiModule.institutionsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useInstitutions(0, "BNP"));
        expect(apiModule.institutionsApi.list).toHaveBeenCalledWith(0, 20, "BNP", undefined);
    });

    it("calls institutionsApi.list with country filter", () => {
        (apiModule.institutionsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useInstitutions(0, undefined, "FR"));
        expect(apiModule.institutionsApi.list).toHaveBeenCalledWith(0, 20, undefined, "FR");
    });

    it("calls institutionsApi.list with page param", () => {
        (apiModule.institutionsApi.list as jest.Mock).mockResolvedValue(mockPageResult);
        renderHook(() => useInstitutions(2));
        expect(apiModule.institutionsApi.list).toHaveBeenCalledWith(2, 20, undefined, undefined);
    });
});

describe("useInstitution", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls institutionsApi.get when id is provided", () => {
        (apiModule.institutionsApi.get as jest.Mock).mockResolvedValue(mockPageResult.items[0]);
        renderHook(() => useInstitution("inst-1"));
        expect(apiModule.institutionsApi.get).toHaveBeenCalledWith("inst-1");
    });

    it("does not call institutionsApi.get when id is empty", () => {
        renderHook(() => useInstitution(""));
        expect(apiModule.institutionsApi.get).not.toHaveBeenCalled();
    });
});