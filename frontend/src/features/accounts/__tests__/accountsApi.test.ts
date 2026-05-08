import { accountsApi } from "@/features/accounts/api/accountsApi";

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
  const payload = btoa(JSON.stringify({
    sub: "user-123",
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  return `${header}.${payload}.signature`;
}

describe("accountsApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "auth_token") return makeValidToken();
      return null;
    });
  });

  it("lists accounts with Authorization header", async () => {
    mockResponse({ items: [], totalItems: 0, totalPages: 0, page: 0, pageSize: 20, isEmpty: true, isFirst: true, isLast: true });
    await accountsApi.list();
    expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer "),
          }),
        })
    );
  });

  it("gets a single account", async () => {
    const id = "abc-123";
    mockResponse({ id, name: "Test", type: "SAVINGS", currency: "EUR", status: "ACTIVE", userId: "u1", institutionId: "i1" });
    const result = await accountsApi.get(id);
    expect(result.id).toBe(id);
    expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/accounts/${id}`),
        expect.anything()
    );
  });

  it("closes an account with DELETE", async () => {
    mockResponse(null, 204);
    await accountsApi.close("acc-1");
    expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts/acc-1"),
        expect.objectContaining({ method: "DELETE" })
    );
  });

  it("creates an account with POST", async () => {
    const body = { institutionId: "i1", name: "Savings", type: "SAVINGS", currency: "EUR" };
    mockResponse({ ...body, id: "new-id", userId: "u1", status: "ACTIVE" });
    await accountsApi.create(body);
    expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/accounts"),
        expect.objectContaining({ method: "POST" })
    );
  });
});