"use client";

import useSWR from "swr";
import { accountsApi } from "../api/accountsApi";

export function useAccounts(page = 0) {
    const { data, error, isLoading, mutate } = useSWR(["accounts", page], () => accountsApi.list(page));
    return { data, error, isLoading, mutate };
}

export function useAccount(id: string) {
    const { data, error, isLoading } = useSWR(id ? ["account", id] : null, () => accountsApi.get(id));
    return { account: data, error, isLoading };
}
