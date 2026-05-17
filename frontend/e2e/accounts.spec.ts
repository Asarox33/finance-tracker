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

test("accounts can show and reactivate closed accounts", async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page);
    let reactivated = false;
    const accountPage = () => ({
        items: [
            {
                id: "acc-1",
                userId: "user-123",
                institutionId: "inst-1",
                name: "Old savings",
                type: "SAVINGS",
                currency: "EUR",
                status: reactivated ? "ACTIVE" : "CLOSED",
            },
        ],
        totalItems: 1,
        totalPages: 1,
        page: 0,
        pageSize: 20,
        isEmpty: false,
        isFirst: true,
        isLast: true,
    });
    await page.route("**/api/accounts**", (route) => {
        const request = route.request();
        if (request.method() === "POST") {
            reactivated = true;
            return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(accountPage().items[0]) });
        }
        const includeClosed = new URL(request.url()).searchParams.get("includeClosed") === "true";
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(includeClosed ? accountPage() : emptyPage),
        });
    });
    await page.route("**/api/institutions**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ...emptyPage, items: [{ id: "inst-1", name: "Bank", country: "FR", type: "BANK", bic: null }] }),
        })
    );

    await page.goto("/accounts");
    await expect(page.getByText("Old savings")).not.toBeVisible();
    await page.getByLabel("Show closed accounts").check();
    await expect(page.getByText("Old savings")).toBeVisible();
    await page.getByRole("button", { name: "Reactivate account" }).click();
    await expect(page.getByText("Active")).toBeVisible();
});
