import { expect, test } from "@playwright/test";
import { authenticateUser, mockUserProfile } from "./helpers/auth";

test("dashboard renders translated labels", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page, "FRA");
    await page.route("**/api/accounts**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [], totalItems: 0, totalPages: 1, page: 0, pageSize: 20, isEmpty: true, isFirst: true, isLast: true }),
        })
    );
    await page.route("**/api/institutions**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ items: [], totalItems: 0, totalPages: 1, page: 0, pageSize: 20, isEmpty: true, isFirst: true, isLast: true }),
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
            body: JSON.stringify({ startValue: 0, endValue: 0, currency: "EUR", gainLoss: 0, gainLossBasisPoints: 0, from: "2023-01-15", to: "2024-01-15" }),
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
