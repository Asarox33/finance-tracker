"use client";

import useSWR from "swr";
import { analyticsApi } from "../api/analyticsApi";
import { monthsAgo, today } from "@/lib/format";

function resolveCurrency(currency: string | undefined, argc: number): string | undefined {
    return argc === 0 ? "EUR" : currency;
}

export function usePortfolioValue(currency?: string) {
    const resolved = resolveCurrency(currency, arguments.length);
    const asOf = today();
    const { data, error, isLoading } = useSWR(resolved ? ["portfolio-value", asOf, resolved] : null, () =>
        analyticsApi.portfolioValue(asOf, resolved!)
    );
    return { data, error, isLoading };
}

export function usePerformance(currency?: string, months = 12) {
    const resolved = resolveCurrency(currency, arguments.length);
    const from = monthsAgo(months);
    const to = today();
    const { data, error, isLoading } = useSWR(resolved ? ["performance", from, to, resolved] : null, () =>
        analyticsApi.performance(from, to, resolved!)
    );
    return { data, error, isLoading };
}

export function usePerformanceAfterFees(currency?: string, months = 12) {
    const resolved = resolveCurrency(currency, arguments.length);
    const from = monthsAgo(months);
    const to = today();
    const { data, error, isLoading } = useSWR(resolved ? ["performance-fees", from, to, resolved] : null, () =>
        analyticsApi.performanceAfterFees(from, to, resolved!)
    );
    return { data, error, isLoading };
}

export function usePerformanceAfterInflation(currency?: string, months = 12) {
    const resolved = resolveCurrency(currency, arguments.length);
    const from = monthsAgo(months);
    const to = today();
    const { data, error, isLoading } = useSWR(resolved ? ["performance-inflation", from, to, resolved] : null, () =>
        analyticsApi.performanceAfterInflation(from, to, resolved!)
    );
    return { data, error, isLoading };
}
