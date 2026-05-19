"use client";

import useSWR from "swr";
import { transactionsApi } from "../api/transactionsApi";

export function useTransactions(accountId: string, page = 0, from?: string, to?: string, pageSize = 20) {
    const { data, error, isLoading, mutate } = useSWR(
        accountId ? ["transactions", accountId, page, from, to, pageSize] : null,
        () => transactionsApi.list(accountId, page, pageSize, from, to)
    );
    return { data, error, isLoading, mutate };
}

/** Loads all transactions for an account (with optional date filters) for client-side sort and pagination. */
export function useAccountTransactions(accountId: string, from?: string, to?: string) {
    const { data, error, isLoading, mutate } = useSWR(
        accountId ? ["account-transactions", accountId, from, to] : null,
        async () => {
            const probe = await transactionsApi.list(accountId, 0, 1, from, to);
            if (probe.totalItems <= 1) {
                return probe;
            }
            return transactionsApi.list(accountId, 0, probe.totalItems, from, to);
        }
    );
    return { transactions: data?.items ?? [], totalItems: data?.totalItems ?? 0, error, isLoading, mutate };
}
