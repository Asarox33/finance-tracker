import { expect, test } from "@playwright/test";
import { authenticateUser, mockUserProfile } from "./helpers/auth";

test("dashboard renders translated labels", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page, "FRA");
    await page.route("**/api/accounts**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: [],
                totalItems: 0,
                totalPages: 1,
                page: 0,
                pageSize: 20,
                isEmpty: true,
                isFirst: true,
                isLast: true,
            }),
        })
    );
    await page.route("**/api/institutions**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: [],
                totalItems: 0,
                totalPages: 1,
                page: 0,
                pageSize: 20,
                isEmpty: true,
                isFirst: true,
                isLast: true,
            }),
        })
    );
    await page.route("**/api/analytics/portfolio-value**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ totalValue: 0, currency: "EUR", asOf: "2024-01-15", snapshots: [] }),
        })
    );
    await page.route("**/api/analytics/performance**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                startValue: 0,
                endValue: 0,
                currency: "EUR",
                gainLoss: 0,
                gainLossBasisPoints: 0,
                from: "2023-01-15",
                to: "2024-01-15",
            }),
        })
    );

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
    await expect(page.getByText("Valeur du portefeuille", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bien démarrer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajouter votre première institution" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajouter un compte" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enregistrer une transaction" })).toBeVisible();
});

test("dashboard account breakdown links to filtered transactions", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page);
    await page.route("**/api/institutions**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: [],
                totalItems: 1,
                totalPages: 1,
                page: 0,
                pageSize: 1,
                isEmpty: false,
                isFirst: true,
                isLast: true,
            }),
        })
    );
    await page.route("**/api/analytics/portfolio-value**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                totalValue: 12345,
                currency: "EUR",
                asOf: "2024-01-15",
                snapshots: [
                    {
                        accountId: "acc-1",
                        accountName: "Very long brokerage account name for dashboard",
                        accountType: "BROKERAGE",
                        institutionId: "inst-1",
                        institutionName: "Very long institution name for dashboard",
                        institutionType: "BROKER",
                        currency: "EUR",
                        valueInAccountCurrency: 12345,
                        valueInReferenceCurrency: 12345,
                        referenceCurrency: "EUR",
                        asOf: "2024-01-15",
                    },
                ],
            }),
        })
    );
    await page.route("**/api/analytics/performance**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                startValue: 10000,
                endValue: 12345,
                currency: "EUR",
                gainLoss: 2345,
                gainLossBasisPoints: 2345,
                from: "2023-01-15",
                to: "2024-01-15",
            }),
        })
    );

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Account Breakdown" })).toBeVisible();
    await expect(page.getByText("Very long brokerage account name for dashboard")).toHaveAttribute(
        "title",
        "Very long brokerage account name for dashboard"
    );
    await expect(page.getByText("Very long institution name for dashboard")).toHaveAttribute(
        "title",
        "Very long institution name for dashboard"
    );
    await expect(
        page.getByRole("link", { name: "View transactions for Very long brokerage account name for dashboard" })
    ).toHaveAttribute("href", "/transactions?accountId=acc-1");
});

test("dashboard breakdown paginates enriched snapshots", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page, "ENG", { tablePageSize: 20 });
    await page.route("**/api/institutions**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: [],
                totalItems: 1,
                totalPages: 1,
                page: 0,
                pageSize: 1,
                isEmpty: false,
                isFirst: true,
                isLast: true,
            }),
        })
    );

    const snapshots = Array.from({ length: 25 }, (_, index) => {
        const label = String(index + 1).padStart(2, "0");
        return {
            accountId: `acc-${index + 1}`,
            accountName: `Account ${label}`,
            accountType: "CHECKING",
            institutionId: "inst-1",
            institutionName: "Test Bank",
            institutionType: "BANK",
            currency: "EUR",
            valueInAccountCurrency: 1000,
            valueInReferenceCurrency: 1000,
            referenceCurrency: "EUR",
            asOf: "2024-01-15",
        };
    });

    await page.route("**/api/analytics/portfolio-value**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                totalValue: 32500,
                currency: "EUR",
                asOf: "2024-01-15",
                snapshots,
            }),
        })
    );
    await page.route("**/api/analytics/performance**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                startValue: 10000,
                endValue: 32500,
                currency: "EUR",
                gainLoss: 22500,
                gainLossBasisPoints: 2250,
                from: "2023-01-15",
                to: "2024-01-15",
            }),
        })
    );

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Account Breakdown" })).toBeVisible();
    await expect(page.getByText("1–20 of 25")).toBeVisible();
    await expect(page.getByText("Account 01", { exact: true })).toBeVisible();
    await expect(page.getByText("Account 20", { exact: true })).toBeVisible();
    await expect(page.getByText("Account 21", { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("21–25 of 25")).toBeVisible();
    await expect(page.getByText("Account 21", { exact: true })).toBeVisible();
    await expect(page.getByText("Account 25", { exact: true })).toBeVisible();
    await expect(page.getByText("Account 01", { exact: true })).not.toBeVisible();
});
