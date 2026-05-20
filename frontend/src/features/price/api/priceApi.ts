import { http } from "@/lib/http";

export interface AssetPriceRecord {
    id: string;
    assetId: string;
    price: number;
    currency: string;
    date: string;
    appliedPriceDate: string;
}

export interface PriceImportResult {
    importedCount: number;
    candidates: number;
    date: string;
}

export const pricesApi = {
    record: (body: { assetId: string; price: number; currency: string; date: string }) =>
        http.post<AssetPriceRecord>("/prices", body),

    importEndOfDay: (date?: string) => {
        const params = date ? `?date=${date}` : "";
        return http.post<PriceImportResult>(`/prices/import${params}`, {});
    },
};
