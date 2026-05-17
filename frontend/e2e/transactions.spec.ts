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
