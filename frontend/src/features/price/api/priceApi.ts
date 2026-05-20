import { http } from "@/lib/http";

export interface AssetPriceRecord {
    id: string;
    assetId: string;
    price: number;
    currency: string;
    date: string;
    appliedPriceDate: string;
}

export const pricesApi = {
    record: (body: { assetId: string; price: number; currency: string; date: string }) =>
        http.post<AssetPriceRecord>("/prices", body),
};
