import { http } from "@/lib/http";
import type { Asset, AssetType, PageResult } from "@/shared/types";

export const ASSET_TYPES: AssetType[] = [
    "CASH",
    "STOCK",
    "BOND",
    "ETF",
    "MUTUAL_FUND",
    "REAL_ESTATE",
    "CRYPTO",
    "COMMODITY",
    "OTHER",
];

export const assetsApi = {
    list: (page = 0, pageSize = 20, name?: string) => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        if (name) params.set("name", name);
        return http.get<PageResult<Asset>>(`/assets?${params}`);
    },

    get: (id: string) => http.get<Asset>(`/assets/${id}`),

    create: (body: { name: string; type: AssetType; currency: string; isin?: string; ticker?: string }) =>
        http.post<Asset>("/assets", body),
};
