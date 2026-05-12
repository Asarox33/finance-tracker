import { http } from "@/lib/http";
import type { Institution, PageResult } from "@/shared/types";

export type InstitutionType = "BANK" | "BROKER" | "INSURANCE" | "CRYPTO_EXCHANGE" | "OTHER";

export const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
    { value: "BANK", label: "Bank" },
    { value: "BROKER", label: "Broker" },
    { value: "INSURANCE", label: "Insurance" },
    { value: "CRYPTO_EXCHANGE", label: "Crypto Exchange" },
    { value: "OTHER", label: "Other" },
];

export const institutionsApi = {
    list: (page = 0, pageSize = 20, name?: string, country?: string) => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (name) params.set("name", name);
        if (country) params.set("country", country);
        return http.get<PageResult<Institution>>(`/institutions?${params}`);
    },

    get: (id: string) => http.get<Institution>(`/institutions/${id}`),

    create: (body: { name: string; country: string; type: InstitutionType; bic?: string }) =>
        http.post<Institution>("/institutions", body),
};
