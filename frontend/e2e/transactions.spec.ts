import { expect, test } from "@playwright/test";
import { authenticateUser, mockUserProfile } from "./helpers/auth";

test("transactions renders translated labels", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page, "FRA");
    await page.route("**/api/accounts**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: [{ id: "acc-1", userId: "user-123", institutionId: "inst-1", name: "Compte courant", type: "CHECKING", currency: "EUR", status: "ACTIVE" }],
                totalItems: 1,
                totalPages: 1,
                page: 0,
                pageSize: 20,
                isEmpty: false,
                isFirst: true,
                isLast: true,
            }),
        })
    );
    await page.route("**/api/transactions**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [], totalItems: 0, totalPages: 1, page: 0, pageSize: 20, isEmpty: true, isFirst: true, isLast: true }),
        })
    );

    await page.goto("/transactions");
    await expect(page.getByRole("heading", { name: "Transactions" })).toBeVisible();
    await expect(page.getByLabel("Sélectionner un compte pour voir les transactions")).toBeVisible();
    await page.getByLabel("Sélectionner un compte pour voir les transactions").selectOption("acc-1");
    await expect(page.getByText("Aucune transaction")).toBeVisible();
    await page.getByRole("button", { name: "+ Nouvelle transaction" }).click();
    await expect(page.getByRole("heading", { name: "Nouvelle transaction" })).toBeVisible();
    await expect(page.getByLabel("Montant (EUR)")).toBeVisible();
});

test("transactions supports date filters, details, and delete", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page);
    const transaction = {
        id: "tx-1",
        accountId: "acc-1",
        assetId: null,
        type: "DEPOSIT",
        amount: 10000,
        currency: "EUR",
        date: "2024-01-15",
        label: "Salary",
        notes: "Monthly salary",
        appliedFxRate: null,
        appliedFxRateScale: null,
        appliedFxRateDate: null,
        appliedFxSourceCurrency: null,
        appliedFxTargetCurrency: null,
    };
    let deleted = false;
    await page.route("**/api/accounts**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: [{ id: "acc-1", userId: "user-123", institutionId: "inst-1", name: "Main", type: "CHECKING", currency: "EUR", status: "ACTIVE" }],
                totalItems: 1,
                totalPages: 1,
                page: 0,
                pageSize: 20,
                isEmpty: false,
                isFirst: true,
                isLast: true,
            }),
        })
    );
    await page.route("**/api/transactions**", (route) => {
        const request = route.request();
        if (request.url().includes("/api/transactions/tx-1")) {
            if (request.method() === "DELETE") {
                deleted = true;
                return route.fulfill({ status: 204 });
            }
            return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(transaction) });
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                items: deleted ? [] : [transaction],
                totalItems: deleted ? 0 : 1,
                totalPages: 1,
                page: 0,
                pageSize: 20,
                isEmpty: deleted,
                isFirst: true,
                isLast: true,
            }),
        });
    });

    await page.goto("/transactions");
    await page.getByLabel("Select account to view transactions").selectOption("acc-1");
    await page.getByLabel("From", { exact: true }).fill("2024-01-01");
    await page.getByLabel("To", { exact: true }).fill("2024-01-31");
    await expect(page.getByText("Salary", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Details" }).click();
    await expect(page.getByRole("heading", { name: "Transaction details" })).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).first().click();
    await page.locator("[role='alertdialog'] button").last().click();
    await expect(page.getByText("No transactions")).toBeVisible();
});
