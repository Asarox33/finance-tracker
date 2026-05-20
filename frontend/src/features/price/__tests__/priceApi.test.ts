import { pricesApi } from "@/features/price/api/priceApi";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: () => null },
        json: async () => body,
    });
}

function makeValidToken(): string {
    const header = btoa(JSON.stringify({ alg: "HS256" }));
    const payload = btoa(
        JSON.stringify({
            sub: "user-123",
            exp: Math.floor(Date.now() / 1000) + 3600,
        })
    );
    return `${header}.${payload}.signature`;
}

const mockPriceRecord = {
    id: "price-1",
    assetId: "asset-1",
    price: 42_500_00,
    currency: "EUR",
    date: "2024-06-01",
    appliedPriceDate: "2024-06-01",
};

describe("pricesApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("records an asset price with POST (201 created)", async () => {
        mockResponse(mockPriceRecord, 201);
        const result = await pricesApi.record({
            assetId: "asset-1",
            price: 42_500_00,
            currency: "EUR",
            date: "2024-06-01",
        });
        expect(result).toEqual(mockPriceRecord);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/prices"),
            expect.objectContaining({ method: "POST" })
        );
        const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
        expect(body).toEqual({
            assetId: "asset-1",
            price: 42_500_00,
            currency: "EUR",
            date: "2024-06-01",
        });
    });

    it("accepts POST when overwriting existing price (200 OK)", async () => {
        mockResponse(mockPriceRecord, 200);
        const result = await pricesApi.record({
            assetId: "asset-1",
            price: 42_500_00,
            currency: "EUR",
            date: "2024-06-01",
        });
        expect(result).toEqual(mockPriceRecord);
    });
});
