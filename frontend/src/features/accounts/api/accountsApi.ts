import { http } from "@/lib/http";
import type { Account, PageResult } from "@/shared/types";

export const accountsApi = {
    list: (page = 0, pageSize = 20, includeClosed = true) =>
        http.get<PageResult<Account>>(`/accounts?page=${page}&pageSize=${pageSize}&includeClosed=${includeClosed}`),

    get: (id: string) => http.get<Account>(`/accounts/${id}`),

    create: (body: { institutionId: string; name: string; type: string; currency: string }) =>
        http.post<Account>("/accounts", body),

    close: (id: string) => http.delete<void>(`/accounts/${id}`),

    reactivate: (id: string) => http.post<Account>(`/accounts/${id}/reactivate`, {}),
};
