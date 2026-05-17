import { http } from "@/lib/http";
import type { Account, AccountType, PageResult } from "@/shared/types";

export const accountsApi = {
    list: (page = 0, pageSize = 20, includeClosed = true, type?: AccountType) => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            includeClosed: String(includeClosed),
        });
        if (type) params.set("type", type);
        return http.get<PageResult<Account>>(`/accounts?${params}`);
    },

    get: (id: string) => http.get<Account>(`/accounts/${id}`),

    create: (body: { institutionId: string; name: string; type: string; currency: string }) =>
        http.post<Account>("/accounts", body),

    close: (id: string) => http.delete<void>(`/accounts/${id}`),

    reactivate: (id: string) => http.post<Account>(`/accounts/${id}/reactivate`, {}),
};
