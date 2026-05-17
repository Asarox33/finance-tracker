"use client";

import useSWR from "swr";
import { institutionsApi, type InstitutionType } from "../api/institutionsApi";

export function useInstitutions(page = 0, name?: string, country?: string, pageSize = 20, type?: InstitutionType) {
    const { data, error, isLoading, mutate } = useSWR(["institutions", page, name, country, pageSize, type], () =>
        institutionsApi.list(page, pageSize, name, country, type)
    );
    return { data, error, isLoading, mutate };
}

export function useInstitution(id: string) {
    const { data, error, isLoading } = useSWR(id ? ["institution", id] : null, () => institutionsApi.get(id));
    return { institution: data, error, isLoading };
}
