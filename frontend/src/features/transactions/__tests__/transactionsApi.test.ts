import {transactionsApi} from "@/features/transactions/api/transactionsApi";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        headers: {get: () => null},
        json: async () => body,
    });
}

function makeValidToken(): string {
    const header = btoa(JSON.stringify({alg: "HS256"}));
    const payload = btoa(JSON.stringify({
        sub: "user-123",
        exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    return `${header}.${payload}.signature`;
}

const mockTransaction = {
    id: "tx-1",
    accountId: "acc-1",
    assetId: null,
    type: "DEPOSIT",
    amount: 10000,
    currency: "EUR",
    date: "2024-01-15",
    label: "Salary",
    notes: null,
    appliedFxRate: null,
    appliedFxRateScale: null,
    appliedFxRateDate: null,
    appliedFxSourceCurrency: null,
    appliedFxTargetCurrency: null,
};

describe("transactionsApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("lists transactions with accountId query param", async () => {
        mockResponse({
            items: [mockTransaction],
            totalItems: 1,
            totalPages: 1,
            page: 0,
            pageSize: 20,
            isEmpty: false,
            isFirst: true,
            isLast: true
        });
        await transactionsApi.list("acc-1");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("accountId=acc-1"),
            expect.anything()
        );
    });

    it("lists transactions with pagination params", async () => {
        mockResponse({
            items: [],
            totalItems: 0,
            totalPages: 0,
            page: 1,
            pageSize: 20,
            isEmpty: true,
            isFirst: false,
            isLast: true
        });
        await transactionsApi.list("acc-1", 1, 20);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("page=1"),
            expect.anything()
        );
    });

    it("lists transactions with optional date range", async () => {
        mockResponse({
            items: [],
            totalItems: 0,
            totalPages: 0,
            page: 0,
            pageSize: 20,
            isEmpty: true,
            isFirst: true,
            isLast: true
        });
        await transactionsApi.list("acc-1", 0, 20, "2024-01-01", "2024-12-31");
        const url = mockFetch.mock.calls[0][0] as string;
        expect(url).toContain("from=2024-01-01");
        expect(url).toContain("to=2024-12-31");
    });

    it("gets a single transaction by id", async () => {
        mockResponse(mockTransaction);
        const result = await transactionsApi.get("tx-1");
        expect(result.id).toBe("tx-1");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/transactions/tx-1"),
            expect.anything()
        );
    });

    it("creates a transaction with POST", async () => {
        mockResponse(mockTransaction, 201);
        await transactionsApi.create({
            accountId: "acc-1",
            type: "DEPOSIT",
            amount: 10000,
            currency: "EUR",
            date: "2024-01-15",
            label: "Salary",
        });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/transactions"),
            expect.objectContaining({method: "POST"})
        );
    });

    it("sends correct body on create", async () => {
        mockResponse(mockTransaction, 201);
        await transactionsApi.create({
            accountId: "acc-1",
            type: "DEPOSIT",
            amount: 10000,
            currency: "EUR",
            date: "2024-01-15",
            label: "Salary",
            notes: "Monthly salary",
        });
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.accountId).toBe("acc-1");
        expect(body.amount).toBe(10000);
        expect(body.notes).toBe("Monthly salary");
    });
});