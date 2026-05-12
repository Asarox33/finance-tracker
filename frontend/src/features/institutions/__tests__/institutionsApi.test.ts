import {institutionsApi} from "@/features/institutions/api/institutionsApi";

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

const mockInstitution = {
    id: "inst-1",
    name: "BNP Paribas",
    country: "FR",
    type: "BANK",
    bic: "BNPAFRPP",
};

const mockPageResult = {
    items: [mockInstitution],
    totalItems: 1,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

describe("institutionsApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("lists institutions with auth header", async () => {
        mockResponse(mockPageResult);
        await institutionsApi.list();
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/institutions"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining("Bearer "),
                }),
            })
        );
    });

    it("lists institutions with pagination params", async () => {
        mockResponse(mockPageResult);
        await institutionsApi.list(1, 20);
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("page=1"),
            expect.anything()
        );
    });

    it("lists institutions with name filter", async () => {
        mockResponse(mockPageResult);
        await institutionsApi.list(0, 20, "BNP");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("name=BNP"),
            expect.anything()
        );
    });

    it("lists institutions with country filter", async () => {
        mockResponse(mockPageResult);
        await institutionsApi.list(0, 20, undefined, "FR");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("country=FR"),
            expect.anything()
        );
    });

    it("gets a single institution by id", async () => {
        mockResponse(mockInstitution);
        const result = await institutionsApi.get("inst-1");
        expect(result.id).toBe("inst-1");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/institutions/inst-1"),
            expect.anything()
        );
    });

    it("creates an institution with POST", async () => {
        mockResponse(mockInstitution, 201);
        await institutionsApi.create({name: "BNP Paribas", country: "FR", type: "BANK", bic: "BNPAFRPP"});
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/institutions"),
            expect.objectContaining({method: "POST"})
        );
    });

    it("sends correct body on create", async () => {
        mockResponse(mockInstitution, 201);
        await institutionsApi.create({name: "BNP Paribas", country: "FR", type: "BANK", bic: "BNPAFRPP"});
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.name).toBe("BNP Paribas");
        expect(body.country).toBe("FR");
        expect(body.type).toBe("BANK");
        expect(body.bic).toBe("BNPAFRPP");
    });

    it("creates an institution without BIC", async () => {
        mockResponse({...mockInstitution, bic: null}, 201);
        await institutionsApi.create({name: "Local Bank", country: "FR", type: "OTHER"});
        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.bic).toBeUndefined();
    });
});