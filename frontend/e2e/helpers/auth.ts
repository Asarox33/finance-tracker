import type { Page } from "@playwright/test";
import type { DisplayLanguage } from "@/shared/types";

export function mockUserProfile(
    page: Page,
    preferredLanguage: DisplayLanguage = "ENG",
    overrides?: Partial<{ tablePageSize: number; sessionTimeoutMinutes: number }>
) {
    return page.route("**/api/users/me", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                id: "user-123",
                firstName: "John",
                lastName: "Doe",
                displayName: "johndoe",
                preferredCurrency: "EUR",
                preferredLanguage,
                birthDate: null,
                tablePageSize: overrides?.tablePageSize ?? 20,
                sessionTimeoutMinutes: overrides?.sessionTimeoutMinutes ?? 10,
            }),
        })
    );
}

export async function authenticateUser(page: Page) {
    await page.addInitScript(() => {
        const header = btoa(JSON.stringify({ alg: "HS256" }));
        const payload = btoa(
            JSON.stringify({
                sub: "user-123",
                exp: Math.floor(Date.now() / 1000) + 3600,
            })
        );
        localStorage.setItem("auth_token", `${header}.${payload}.signature`);
        localStorage.setItem("user_id", "user-123");
    });
}
