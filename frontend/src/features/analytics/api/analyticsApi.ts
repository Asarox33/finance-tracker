import {http} from "@/lib/http";
import type {PortfolioPerformance, PortfolioValue} from "@/shared/types";

export const analyticsApi = {
    portfolioValue: (asOf: string, referenceCurrency: string) =>
        http.get<PortfolioValue>(
            `/analytics/portfolio-value?asOf=${asOf}&referenceCurrency=${referenceCurrency}`
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
};
