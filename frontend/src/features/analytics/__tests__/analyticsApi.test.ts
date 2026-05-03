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

const mockPortfolio = {
  totalValue: 100000,
  currency: "EUR",
  asOf: "2024-06-30",
  snapshots: [],
};

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
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("mock-token");
  });

  it("fetches portfolio value with correct params", async () => {
    mockResponse(mockPortfolio);
    await analyticsApi.portfolioValue("2024-06-30", "EUR");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("asOf=2024-06-30"),
      expect.anything()
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("referenceCurrency=EUR"),
      expect.anything()
    );
  });

  it("fetches performance with date range", async () => {
    mockResponse(mockPerf);
    await analyticsApi.performance("2023-06-30", "2024-06-30", "EUR");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("from=2023-06-30"),
      expect.anything()
    );
  });

  it("fetches performance after fees", async () => {
    mockResponse(mockPerf);
    await analyticsApi.performanceAfterFees("2023-06-30", "2024-06-30", "EUR");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("performance-after-fees"),
      expect.anything()
    );
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
