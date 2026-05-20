"use client";

import useSWR from "swr";
import { assetsApi } from "../api/assetsApi";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

const MIN_SEARCH_LENGTH = 3;
const PICKER_PAGE_SIZE = 20;

export function useAssetSearch(query: string) {
    const debouncedQuery = useDebouncedValue(query.trim(), 250);
    const canSearch = debouncedQuery.length >= MIN_SEARCH_LENGTH;

    const { data, error, isLoading } = useSWR(canSearch ? ["asset-search", debouncedQuery] : null, () =>
        assetsApi.list(0, PICKER_PAGE_SIZE, debouncedQuery)
    );

    return {
        assets: data?.items ?? [],
        totalItems: data?.totalItems ?? 0,
        isLoading: canSearch && isLoading,
        error,
        canSearch,
        debouncedQuery,
        minSearchLength: MIN_SEARCH_LENGTH,
    };
}
