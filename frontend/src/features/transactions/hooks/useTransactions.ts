"use client";

import useSWR from "swr";
import { transactionsApi } from "../api/transactionsApi";

export function useTransactions(accountId: string, page = 0, from?: string, to?: string) {
    const { data, error, isLoading, mutate } = useSWR(
        accountId ? ["transactions", accountId, page, from, to] : null,
        () => transactionsApi.list(accountId, page, 20, from, to)
    );
    return { data, error, isLoading, mutate };
}
