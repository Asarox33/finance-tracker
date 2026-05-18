"use client";

import useSWR from "swr";
import { accountsApi } from "../api/accountsApi";
import type { AccountType } from "@/shared/types";

export function useAccounts(page = 0, includeClosed = true, type?: AccountType, pageSize = 20) {
    const { data, error, isLoading, mutate } = useSWR(["accounts", page, includeClosed, type, pageSize], () =>
        accountsApi.list(page, pageSize, includeClosed, type)
    );
    return { data, error, isLoading, mutate };
}

export function useAccount(id: string) {
    const { data, error, isLoading } = useSWR(id ? ["account", id] : null, () => accountsApi.get(id));
    return { account: data, error, isLoading };
}
