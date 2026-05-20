"use client";

import useSWR from "swr";
import { assetsApi } from "../api/assetsApi";

export function useAssets(page = 0, pageSize = 20) {
    const { data, error, isLoading, mutate } = useSWR(["assets", page, pageSize], () => assetsApi.list(page, pageSize));
    return { data, error, isLoading, mutate };
}

export function useAsset(id: string) {
    const { data, error, isLoading } = useSWR(id ? ["asset", id] : null, () => assetsApi.get(id));
    return { asset: data, error, isLoading };
}
