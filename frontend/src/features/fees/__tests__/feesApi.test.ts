import { feesApi } from "@/features/fees/api/feesApi";

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

const mockFee = {
    id: "fee-1",
    accountId: "acc-1",
    transactionId: null,
    type: "BROKERAGE",
    amount: 199,
    currency: "EUR",
    date: "2024-06-01",
    label: "Brokerage fee",
};

const mockPage = {
    items: [mockFee],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

describe("feesApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("lists fees for an account", async () => {
        mockResponse(mockPage);
        const result = await feesApi.list("acc-1", 0, 20);
        expect(result).toEqual(mockPage);
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("accountId=acc-1"), expect.anything());
    });

    it("gets a fee by id", async () => {
        mockResponse(mockFee);
        const result = await feesApi.get("fee-1");
        expect(result).toEqual(mockFee);
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/fees/fee-1"), expect.anything());
    });

    it("records a fee with POST (201 created)", async () => {
        mockResponse(mockFee, 201);
        const result = await feesApi.record({
            accountId: "acc-1",
            type: "BROKERAGE",
            amount: 199,
            currency: "EUR",
            date: "2024-06-01",
            label: "Brokerage fee",
        });
        expect(result).toEqual(mockFee);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/fees"),
            expect.objectContaining({ method: "POST" })
        );
        const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
        expect(body).toEqual({
            accountId: "acc-1",
            type: "BROKERAGE",
            amount: 199,
            currency: "EUR",
            date: "2024-06-01",
            label: "Brokerage fee",
        });
    });
});
