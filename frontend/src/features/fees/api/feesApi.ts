import { http } from "@/lib/http";
import type { Fee, PageResult, RecordFeeRequest } from "@/shared/types";

export const feesApi = {
    list: (accountId: string, page = 0, pageSize = 20) => {
        const params = new URLSearchParams({
            accountId,
            page: String(page),
            pageSize: String(pageSize),
        });
        return http.get<PageResult<Fee>>(`/fees?${params}`);
    },

    get: (feeId: string) => http.get<Fee>(`/fees/${feeId}`),

    record: (body: RecordFeeRequest) => http.post<Fee>("/fees", body),
};
