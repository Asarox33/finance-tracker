import { http } from "@/lib/http";

export interface FxRateRecord {
    id: string;
    sourceCurrency: string;
    targetCurrency: string;
    rate: number;
    rateScale: number;
    date: string;
    appliedRateDate: string;
}

export interface FxImportResult {
    importedCount: number;
    date: string;
}

export const fxApi = {
    importRates: (date?: string) => {
        const params = date ? `?date=${date}` : "";
        return http.post<FxImportResult>(`/fx/import${params}`, {});
    },

    getRate: (sourceCurrency: string, targetCurrency: string, date: string) =>
        http.get<FxRateRecord>(
            `/fx/rates?sourceCurrency=${sourceCurrency}&targetCurrency=${targetCurrency}&date=${date}`
        ),
};
