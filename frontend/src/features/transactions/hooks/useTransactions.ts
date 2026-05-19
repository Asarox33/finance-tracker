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
