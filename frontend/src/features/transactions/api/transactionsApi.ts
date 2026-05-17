import { http } from "@/lib/http";
import type { PageResult, Transaction } from "@/shared/types";

const EXPLICIT_SIGN_TYPES = ["TRANSFER", "OTHER"];

function assertValidAmountForType(type: string, amount: number) {
    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount === 0) {
        throw new Error("Transaction amount must be a non-zero integer in minor units.");
    }
    if (amount < 0 && !EXPLICIT_SIGN_TYPES.includes(type)) {
        throw new Error("Negative amount is only allowed for TRANSFER or OTHER transactions.");
    }
}

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
    }) => {
        assertValidAmountForType(body.type, body.amount);
        return http.post<Transaction>("/transactions", body);
    },

    delete: (id: string) => http.delete<void>(`/transactions/${id}`),
};
