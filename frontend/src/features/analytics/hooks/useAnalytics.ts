"use client";

import useSWR from "swr";
import { analyticsApi } from "../api/analyticsApi";
import { today, monthsAgo } from "@/lib/format";

export function usePortfolioValue(currency = "EUR") {
  const asOf = today();
  const { data, error, isLoading } = useSWR(
    ["portfolio-value", asOf, currency],
    () => analyticsApi.portfolioValue(asOf, currency)
  );
  return { data, error, isLoading };
}

export function usePerformance(currency = "EUR", months = 12) {
  const from = monthsAgo(months);
  const to = today();
  const { data, error, isLoading } = useSWR(
    ["performance", from, to, currency],
    () => analyticsApi.performance(from, to, currency)
  );
  return { data, error, isLoading };
}

export function usePerformanceAfterFees(currency = "EUR", months = 12) {
  const from = monthsAgo(months);
  const to = today();
  const { data, error, isLoading } = useSWR(
    ["performance-fees", from, to, currency],
    () => analyticsApi.performanceAfterFees(from, to, currency)
  );
  return { data, error, isLoading };
}

export function usePerformanceAfterInflation(currency = "EUR", months = 12) {
  const from = monthsAgo(months);
  const to = today();
  const { data, error, isLoading } = useSWR(
    ["performance-inflation", from, to, currency],
    () => analyticsApi.performanceAfterInflation(from, to, currency)
  );
  return { data, error, isLoading };
}
