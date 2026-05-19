import { expect, test } from "@playwright/test";
import { authenticateUser, mockUserProfile } from "./helpers/auth";

test("analytics renders translated labels", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page, "FRA");
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

    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analyses" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Période" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Valeur actuelle" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Détail de la performance" })).toBeVisible();
    await expect(page.getByText("Performance brute")).toBeVisible();
});
