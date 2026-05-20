import type { PortfolioPerformance } from "@/shared/types";

export type NetPerformanceMode = "real" | "afterFees" | "gross";

export function isInflationAdjusted(
    gross: PortfolioPerformance,
    afterInflation: PortfolioPerformance
): boolean {
    return afterInflation.endValue !== gross.endValue;
}

export function resolveNetPerformanceMode(
    gross: PortfolioPerformance | undefined,
    afterFees: PortfolioPerformance | undefined,
    afterInflation: PortfolioPerformance | undefined
): NetPerformanceMode {
    if (gross && afterInflation && isInflationAdjusted(gross, afterInflation)) {
        return "real";
    }
    if (afterFees) {
        return "afterFees";
    }
    return "gross";
}

export function pickPerformanceByMode(
    mode: NetPerformanceMode,
    gross: PortfolioPerformance | undefined,
    afterFees: PortfolioPerformance | undefined,
    afterInflation: PortfolioPerformance | undefined
): PortfolioPerformance | undefined {
    switch (mode) {
        case "real":
            return afterInflation ?? afterFees ?? gross;
        case "afterFees":
            return afterFees ?? gross;
        default:
            return gross;
    }
}

export function computePortfolioDayChange(
    todayTotal: number,
    yesterdayTotal: number
): { deltaMinor: number; basisPoints: number } | null {
    if (!Number.isFinite(todayTotal) || !Number.isFinite(yesterdayTotal)) {
        return null;
    }
    const deltaMinor = todayTotal - yesterdayTotal;
    const basisPoints =
        yesterdayTotal !== 0 ? Math.round((deltaMinor * 10000) / yesterdayTotal) : todayTotal !== 0 ? 10000 : 0;
    return { deltaMinor, basisPoints };
}
