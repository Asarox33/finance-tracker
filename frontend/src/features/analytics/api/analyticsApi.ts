import { http } from "@/lib/http";
import type { PortfolioPerformance, PortfolioValue } from "@/shared/types";

export interface PortfolioHistoryPoint {
    date: string;
    totalValue: number;
    currency: string;
}

export interface PortfolioHistoryResponse {
    points: PortfolioHistoryPoint[];
    referenceCurrency: string;
}

export const analyticsApi = {
    portfolioValue: (asOf: string, referenceCurrency: string) =>
        http.get<PortfolioValue>(`/analytics/portfolio-value?asOf=${asOf}&referenceCurrency=${referenceCurrency}`),

    portfolioHistory: (days: number, referenceCurrency: string) =>
        http.get<PortfolioHistoryResponse>(
            `/analytics/portfolio-history?days=${days}&referenceCurrency=${referenceCurrency}`
        ),

    performance: (from: string, to: string, referenceCurrency: string) =>
        http.get<PortfolioPerformance>(
            `/analytics/performance?from=${from}&to=${to}&referenceCurrency=${referenceCurrency}`
        ),

    performanceAfterFees: (from: string, to: string, referenceCurrency: string) =>
        http.get<PortfolioPerformance>(
            `/analytics/performance-after-fees?from=${from}&to=${to}&referenceCurrency=${referenceCurrency}`
        ),

    performanceAfterInflation: (from: string, to: string, referenceCurrency: string) =>
        http.get<PortfolioPerformance>(
            `/analytics/performance-after-inflation?from=${from}&to=${to}&referenceCurrency=${referenceCurrency}`
        ),

    performanceSummary: (from: string, to: string, referenceCurrency: string) =>
        http.get<{
            gross: PortfolioPerformance;
            afterFees: PortfolioPerformance;
            afterInflation: PortfolioPerformance;
            inflationApplied: boolean;
        }>(`/analytics/performance-summary?from=${from}&to=${to}&referenceCurrency=${referenceCurrency}`),
};
