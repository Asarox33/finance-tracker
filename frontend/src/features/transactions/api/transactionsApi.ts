import { http } from "@/lib/http";
import type { PageResult, Transaction } from "@/shared/types";

export const transactionsApi = {
    list: (accountId: string, page = 0, pageSize = 20, from?: string, to?: string) => {
        const params = new URLSearchParams({
            accountId,
            page: String(page),
            pageSize: String(pageSize),
        });
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return http.get<PageResult<Transaction>>(`/transactions?${params}`);
    },

    get: (id: string) => http.get<Transaction>(`/transactions/${id}`),

    create: (body: {
        accountId: string;
        assetId?: string;
        type: string;
        amount: number;
        currency: string;
        date: string;
        label: string;
        notes?: string;
    }) => http.post<Transaction>("/transactions", body),

    delete: (id: string) => http.delete<void>(`/transactions/${id}`),
};
