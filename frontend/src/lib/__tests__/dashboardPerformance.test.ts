import {
    computePortfolioDayChange,
    isInflationAdjusted,
    resolveNetPerformanceMode,
} from "@/lib/dashboardPerformance";
import type { PortfolioPerformance } from "@/shared/types";

const perf = (endValue: number, gainLoss: number): PortfolioPerformance => ({
    startValue: 100_000,
    endValue,
    currency: "EUR",
    gainLoss,
    gainLossBasisPoints: 0,
    from: "2024-01-01",
    to: "2024-12-31",
});

describe("isInflationAdjusted", () => {
    it("detects when end value was deflated", () => {
        expect(isInflationAdjusted(perf(110_000, 10_000), perf(108_000, 8_000))).toBe(true);
    });

    it("returns false when end values match", () => {
        expect(isInflationAdjusted(perf(110_000, 10_000), perf(110_000, 8_000))).toBe(false);
    });
});

describe("resolveNetPerformanceMode", () => {
    it("prefers real when inflation adjusted", () => {
        expect(
            resolveNetPerformanceMode(
                perf(110_000, 10_000),
                perf(109_000, 9_000),
                perf(108_000, 8_000)
            )
        ).toBe("real");
    });

    it("falls back to afterFees when no inflation adjustment", () => {
        expect(
            resolveNetPerformanceMode(perf(110_000, 10_000), perf(109_000, 9_000), perf(110_000, 9_000))
        ).toBe("afterFees");
    });
});

describe("computePortfolioDayChange", () => {
    it("computes delta and basis points", () => {
        expect(computePortfolioDayChange(101_000, 100_000)).toEqual({
            deltaMinor: 1000,
            basisPoints: 100,
        });
    });
});
