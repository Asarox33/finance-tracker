import { userProfileApi } from "@/features/user-profile/api/userProfileApi";

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

const mockProfile = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    displayName: "johndoe",
    preferredCurrency: "EUR",
    birthDate: null,
};

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

describe("userProfileApi", () => {
    beforeEach(() => {
        mockFetch.mockClear();
        jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
            if (key === "auth_token") return makeValidToken();
            return null;
        });
    });

    it("fetches current user profile", async () => {
        mockResponse(mockProfile);
        const result = await userProfileApi.getMe();
        expect(result.id).toBe("user-123");
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/users/me"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining("Bearer "),
                }),
            })
        );
    });

    it("updates preferences with PUT", async () => {
        mockResponse(mockProfile);
        await userProfileApi.updatePreferences({
            firstName: "John",
            lastName: "Doe",
            displayName: "johndoe",
            preferredCurrency: "USD",
            birthDate: null,
        });
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/users/me/preferences"),
            expect.objectContaining({ method: "PUT" })
        );
    });

    it("sends updated currency in body", async () => {
        mockResponse(mockProfile);
        await userProfileApi.updatePreferences({
            firstName: "John",
            lastName: "Doe",
            displayName: "johndoe",
            preferredCurrency: "USD",
            birthDate: null,
        });
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.preferredCurrency).toBe("USD");
    });
});
