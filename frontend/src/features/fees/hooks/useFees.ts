"use client";

import useSWR from "swr";
import { feesApi } from "../api/feesApi";
import type { RecordFeeRequest } from "@/shared/types";

export function useFees(accountId: string, page = 0, pageSize = 20) {
    const { data, error, isLoading, mutate } = useSWR(
        accountId ? ["fees", accountId, page, pageSize] : null,
        () => feesApi.list(accountId, page, pageSize)
    );

    async function record(body: RecordFeeRequest) {
        const fee = await feesApi.record(body);
        await mutate();
        return fee;
    }

    return { data, error, isLoading, mutate, record };
}
