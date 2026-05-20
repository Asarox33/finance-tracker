import { http } from "@/lib/http";
import type { PageResult } from "@/shared/types";

export interface InflationIndexRecord {
    id: string;
    currency: string;
    yearMonth: string;
    indexValue: number;
    indexScale: number;
}

export const inflationApi = {
    list: (currency: string, page = 0, pageSize = 24) =>
        http.get<PageResult<InflationIndexRecord>>(
            `/inflation/indices/list?currency=${currency}&page=${page}&pageSize=${pageSize}`
        ),

    record: (body: {
        currency: string;
        yearMonth: string;
        indexValue: number;
        indexScale: number;
    }) => http.post<InflationIndexRecord>("/inflation/indices", body),
};
