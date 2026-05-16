"use client";

import useSWR from "swr";
import { institutionsApi } from "../api/institutionsApi";

export function useInstitutions(page = 0, name?: string, country?: string, pageSize = 20) {
    const { data, error, isLoading, mutate } = useSWR(["institutions", page, name, country, pageSize], () =>
        institutionsApi.list(page, pageSize, name, country)
    );
    return { data, error, isLoading, mutate };
}

export function useInstitution(id: string) {
    const { data, error, isLoading } = useSWR(id ? ["institution", id] : null, () => institutionsApi.get(id));
    return { institution: data, error, isLoading };
}
