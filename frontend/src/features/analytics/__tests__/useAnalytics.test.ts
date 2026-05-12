import { renderHook } from "@testing-library/react";
import {
    usePerformance,
    usePerformanceAfterFees,
    usePerformanceAfterInflation,
    usePortfolioValue,
} from "@/features/analytics/hooks/useAnalytics";
import * as apiModule from "@/features/analytics/api/analyticsApi";

jest.mock("@/features/analytics/api/analyticsApi", () => ({
    analyticsApi: {
        portfolioValue: jest.fn(),
        performance: jest.fn(),
        performanceAfterFees: jest.fn(),
        performanceAfterInflation: jest.fn(),
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

const mockPortfolioValue = {
    totalValue: 100000,
    currency: "EUR",
    asOf: "2024-06-30",
    snapshots: [],
};

const mockPerformance = {
    startValue: 90000,
    endValue: 100000,
    currency: "EUR",
    gainLoss: 10000,
    gainLossBasisPoints: 1111,
    from: "2023-06-30",
    to: "2024-06-30",
};

describe("usePortfolioValue", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls portfolioValue with today and default currency", () => {
        (apiModule.analyticsApi.portfolioValue as jest.Mock).mockResolvedValue(mockPortfolioValue);
        renderHook(() => usePortfolioValue());
        expect(apiModule.analyticsApi.portfolioValue).toHaveBeenCalledWith(
            expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            "EUR"
        );
    });

    it("calls portfolioValue with provided currency", () => {
        (apiModule.analyticsApi.portfolioValue as jest.Mock).mockResolvedValue(mockPortfolioValue);
        renderHook(() => usePortfolioValue("USD"));
        expect(apiModule.analyticsApi.portfolioValue).toHaveBeenCalledWith(expect.any(String), "USD");
    });
});

describe("usePerformance", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls performance with date range and currency", () => {
        (apiModule.analyticsApi.performance as jest.Mock).mockResolvedValue(mockPerformance);
        renderHook(() => usePerformance("EUR", 12));
        expect(apiModule.analyticsApi.performance).toHaveBeenCalledWith(
            expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            "EUR"
        );
    });
});

describe("usePerformanceAfterFees", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls performanceAfterFees with date range and currency", () => {
        (apiModule.analyticsApi.performanceAfterFees as jest.Mock).mockResolvedValue(mockPerformance);
        renderHook(() => usePerformanceAfterFees("EUR", 6));
        expect(apiModule.analyticsApi.performanceAfterFees).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            "EUR"
        );
    });
});

describe("usePerformanceAfterInflation", () => {
    beforeEach(() => jest.clearAllMocks());

    it("calls performanceAfterInflation with date range and currency", () => {
        (apiModule.analyticsApi.performanceAfterInflation as jest.Mock).mockResolvedValue(mockPerformance);
        renderHook(() => usePerformanceAfterInflation("USD", 3));
        expect(apiModule.analyticsApi.performanceAfterInflation).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            "USD"
        );
    });
});
