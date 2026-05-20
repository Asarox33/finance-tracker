import { assetsApi } from "@/features/assets/api/assetsApi";

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

const mockAsset = {
    id: "asset-1",
    name: "Apple Inc.",
    type: "STOCK",
    currency: "USD",
    isin: "US0378331005",
    ticker: "AAPL",
    createdByUserId: "user-123",
};

const mockPageResult = {
    items: [mockAsset],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

describe("assetsApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("lists assets with auth header", async () => {
        mockResponse(mockPageResult);
        await assetsApi.list();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/assets"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining("Bearer "),
                }),
            })
        );
    });

    it("lists assets with pagination params", async () => {
        mockResponse(mockPageResult);
        await assetsApi.list(1, 50);
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("page=1"), expect.anything());
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("pageSize=50"), expect.anything());
    });

    it("lists assets with name filter", async () => {
        mockResponse(mockPageResult);
        await assetsApi.list(0, 20, "Apple");
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("name=Apple"), expect.anything());
    });

    it("gets a single asset by id", async () => {
        mockResponse(mockAsset);
        const result = await assetsApi.get("asset-1");
        expect(result.id).toBe("asset-1");
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/assets/asset-1"), expect.anything());
    });

    it("creates an asset with POST", async () => {
        mockResponse(mockAsset, 201);
        await assetsApi.create({
            name: "Apple Inc.",
            type: "STOCK",
            currency: "USD",
            isin: "US0378331005",
            ticker: "AAPL",
        });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/assets"),
            expect.objectContaining({ method: "POST" })
        );
    });

    it("sends correct body on create", async () => {
        mockResponse(mockAsset, 201);
        await assetsApi.create({
            name: "Apple Inc.",
            type: "STOCK",
            currency: "USD",
            isin: "US0378331005",
            ticker: "AAPL",
        });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.name).toBe("Apple Inc.");
        expect(body.type).toBe("STOCK");
        expect(body.currency).toBe("USD");
        expect(body.isin).toBe("US0378331005");
        expect(body.ticker).toBe("AAPL");
    });

    it("creates an asset without optional identifiers", async () => {
        mockResponse({ ...mockAsset, isin: null, ticker: null }, 201);
        await assetsApi.create({
            name: "Cash EUR",
            type: "CASH",
            currency: "EUR",
        });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.isin).toBeUndefined();
        expect(body.ticker).toBeUndefined();
    });
});
