"use client";

import useSWR from "swr";
import { institutionsApi } from "../api/institutionsApi";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

const MIN_SEARCH_LENGTH = 3;
const PICKER_PAGE_SIZE = 20;

export function useInstitutionSearch(query: string) {
    const debouncedQuery = useDebouncedValue(query.trim(), 250);
    const canSearch = debouncedQuery.length >= MIN_SEARCH_LENGTH;

    const { data, error, isLoading } = useSWR(canSearch ? ["institution-search", debouncedQuery] : null, () =>
        institutionsApi.list(0, PICKER_PAGE_SIZE, debouncedQuery)
    );

    return {
        institutions: data?.items ?? [],
        totalItems: data?.totalItems ?? 0,
        isLoading: canSearch && isLoading,
        error,
        canSearch,
        debouncedQuery,
        minSearchLength: MIN_SEARCH_LENGTH,
    };
}
