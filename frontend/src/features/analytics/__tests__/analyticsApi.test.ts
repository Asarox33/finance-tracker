import { analyticsApi } from "@/features/analytics/api/analyticsApi";

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

const mockPerf = {
    startValue: 90000,
    endValue: 100000,
    currency: "EUR",
    gainLoss: 10000,
    gainLossBasisPoints: 1111,
    from: "2023-06-30",
    to: "2024-06-30",
};

describe("analyticsApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("fetches portfolio value with correct params", async () => {
        mockResponse({
            totalValue: 100000,
            currency: "EUR",
            asOf: "2024-06-30",
            snapshots: [],
        });
        await analyticsApi.portfolioValue("2024-06-30", "EUR");
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("asOf=2024-06-30"), expect.anything());
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("referenceCurrency=EUR"), expect.anything());
    });

    it("returns enriched account snapshots from portfolio value", async () => {
        const enriched = {
            totalValue: 12345,
            currency: "EUR",
            asOf: "2024-06-30",
            snapshots: [
                {
                    accountId: "acc-1",
                    accountName: "Brokerage",
                    accountType: "BROKERAGE",
                    institutionId: "inst-1",
                    institutionName: "Test Bank",
                    institutionType: "BANK",
                    currency: "EUR",
                    valueInAccountCurrency: 12345,
                    valueInReferenceCurrency: 12345,
                    referenceCurrency: "EUR",
                    asOf: "2024-06-30",
                },
            ],
        };
        mockResponse(enriched);
        const result = await analyticsApi.portfolioValue("2024-06-30", "EUR");
        expect(result.snapshots[0]).toMatchObject({
            accountName: "Brokerage",
            institutionName: "Test Bank",
            accountType: "BROKERAGE",
            institutionType: "BANK",
        });
    });

    it("fetches portfolio history in one request", async () => {
        mockResponse({
            referenceCurrency: "EUR",
            points: [
                { date: "2024-06-01", totalValue: 10000, currency: "EUR" },
                { date: "2024-06-30", totalValue: 12000, currency: "EUR" },
            ],
        });
        await analyticsApi.portfolioHistory(30, "EUR");
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/analytics/portfolio-history?days=30"),
            expect.anything()
        );
    });

    it("fetches performance with date range", async () => {
        mockResponse(mockPerf);
        await analyticsApi.performance("2023-06-30", "2024-06-30", "EUR");
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("from=2023-06-30"), expect.anything());
    });

    it("fetches performance after fees", async () => {
        mockResponse(mockPerf);
        await analyticsApi.performanceAfterFees("2023-06-30", "2024-06-30", "EUR");
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("performance-after-fees"), expect.anything());
    });

    it("fetches performance after inflation", async () => {
        mockResponse(mockPerf);
        await analyticsApi.performanceAfterInflation("2023-06-30", "2024-06-30", "EUR");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("performance-after-inflation"),
            expect.anything()
        );
    });
});
