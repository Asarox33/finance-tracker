"use client";

import useSWR from "swr";
import { analyticsApi } from "../api/analyticsApi";
import {
    pickPerformanceByMode,
    resolveNetPerformanceMode,
    type NetPerformanceMode,
} from "@/lib/dashboardPerformance";
import { monthsAgo, today, yesterday } from "@/lib/format";
import type { PortfolioPerformance } from "@/shared/types";

/** Default EUR when the hook is called with no args; skip fetch when `undefined` is passed explicitly. */
function resolveOptionalCurrency(currency: string | undefined, noArgDefault: boolean): string | undefined {
    if (currency !== undefined) return currency;
    return noArgDefault ? "EUR" : undefined;
}

export function usePortfolioValue(currency?: string) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    return usePortfolioValueAsOf(resolved, today());
}

export function usePortfolioValueAsOf(currency: string | undefined, asOf: string) {
    const { data, error, isLoading } = useSWR(
        currency ? ["portfolio-value", asOf, currency] : null,
        () => analyticsApi.portfolioValue(asOf, currency!)
    );
    return { data, error, isLoading };
}

export function usePortfolioDailyChange(currency?: string) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    const asOfToday = today();
    const asOfYesterday = yesterday();
    const { data, error, isLoading } = useSWR(
        resolved ? ["portfolio-daily-change", asOfToday, asOfYesterday, resolved] : null,
        async () => {
            const [todayPortfolio, yesterdayPortfolio] = await Promise.all([
                analyticsApi.portfolioValue(asOfToday, resolved!),
                analyticsApi.portfolioValue(asOfYesterday, resolved!),
            ]);
            return { today: todayPortfolio, yesterday: yesterdayPortfolio };
        }
    );
    return { data, error, isLoading };
}

export function usePerformanceRange(currency: string | undefined, from: string, to: string) {
    const { data, error, isLoading } = useSWR(
        currency ? ["performance", from, to, currency] : null,
        () => analyticsApi.performance(from, to, currency!)
    );
    return { data, error, isLoading };
}

export function usePerformance(currency?: string, months = 12) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    return usePerformanceRange(resolved, monthsAgo(months), today());
}

export function usePerformanceAfterFeesRange(currency: string | undefined, from: string, to: string) {
    const { data, error, isLoading } = useSWR(
        currency ? ["performance-fees", from, to, currency] : null,
        () => analyticsApi.performanceAfterFees(from, to, currency!)
    );
    return { data, error, isLoading };
}

export function usePerformanceAfterFees(currency?: string, months = 12) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    return usePerformanceAfterFeesRange(resolved, monthsAgo(months), today());
}

export function usePerformanceAfterInflationRange(currency: string | undefined, from: string, to: string) {
    const { data, error, isLoading } = useSWR(
        currency ? ["performance-inflation", from, to, currency] : null,
        () => analyticsApi.performanceAfterInflation(from, to, currency!)
    );
    return { data, error, isLoading };
}

export function usePerformanceAfterInflation(currency?: string, months = 12) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    return usePerformanceAfterInflationRange(resolved, monthsAgo(months), today());
}

export interface DashboardPerformanceResult {
    mode: NetPerformanceMode;
    display: PortfolioPerformance | undefined;
    gross: PortfolioPerformance | undefined;
    afterFees: PortfolioPerformance | undefined;
    afterInflation: PortfolioPerformance | undefined;
    inflationApplied: boolean;
}

export function useDashboardPerformance(currency?: string, months = 12) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    const from = monthsAgo(months);
    const to = today();
    const { data, error, isLoading } = useSWR(
        resolved ? ["dashboard-performance", from, to, resolved, months] : null,
        async () => {
            const summary = await analyticsApi.performanceSummary(from, to, resolved!);
            const { gross, afterFees, afterInflation, inflationApplied } = summary;
            const mode = resolveNetPerformanceMode(gross, afterFees, afterInflation);
            return {
                mode,
                display: pickPerformanceByMode(mode, gross, afterFees, afterInflation),
                gross,
                afterFees,
                afterInflation,
                inflationApplied,
            } satisfies DashboardPerformanceResult;
        }
    );
    return { data, error, isLoading };
}

/** Last N calendar days of portfolio totals (inclusive of today). */
export function usePortfolioHistory(currency: string | undefined, days = 30) {
    const resolved = resolveOptionalCurrency(currency, arguments.length === 0);
    const { data, error, isLoading } = useSWR(
        resolved ? ["portfolio-history", days, resolved] : null,
        () => analyticsApi.portfolioHistory(days, resolved!).then((r) => r.points)
    );
    return { data, error, isLoading };
}
