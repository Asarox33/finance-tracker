import { expect, test } from "@playwright/test";
import { authenticateUser, mockUserProfile } from "./helpers/auth";

const emptyPage = { items: [], totalItems: 0, totalPages: 1, page: 0, pageSize: 20, isEmpty: true, isFirst: true, isLast: true };

test("accounts renders translated labels", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page, "FRA");
    await page.route("**/api/accounts**", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(emptyPage) })
    );
    await page.route("**/api/institutions**", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(emptyPage) })
    );

    await page.goto("/accounts");
    await expect(page.getByRole("heading", { name: "Comptes" })).toBeVisible();
    await expect(page.getByText("Aucun compte pour le moment")).toBeVisible();
    await page.getByRole("button", { name: "+ Nouveau compte" }).click();
    await expect(page.getByRole("heading", { name: "Nouveau compte" })).toBeVisible();
    await expect(page.getByLabel("Nom du compte")).toBeVisible();
    await expect(page.getByText("Créez d'abord une institution, puis revenez ici.")).toBeVisible();
});
