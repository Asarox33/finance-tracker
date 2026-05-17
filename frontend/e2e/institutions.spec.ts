import { expect, test } from "@playwright/test";
import { authenticateUser, mockUserProfile } from "./helpers/auth";

const mockPageResult = {
    items: [
        {
            id: "inst-1",
            name: "BNP Paribas",
            country: "FR",
            type: "BANK",
            bic: "BNPAFRPP",
        },
        {
            id: "inst-2",
            name: "Deutsche Bank",
            country: "DE",
            type: "BANK",
            bic: null,
        },
    ],
    totalItems: 2,
    totalPages: 1,
    page: 0,
    pageSize: 20,
    isEmpty: false,
    isFirst: true,
    isLast: true,
};

test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    await mockUserProfile(page);
    await page.route("**/api/institutions**", (route) => {
        if (route.request().method() === "POST") return route.continue();
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockPageResult),
        });
    });
});

test.describe("Institutions page", () => {
    test("renders institution list", async ({ page }) => {
        await page.goto("/institutions");
        await expect(page.getByRole("heading", { name: "Institutions" })).toBeVisible();
        await expect(page.getByText("BNP Paribas")).toBeVisible();
        await expect(page.getByText("Deutsche Bank")).toBeVisible();
    });

    test("shows BIC when present", async ({ page }) => {
        await page.goto("/institutions");
        await expect(page.getByText("BNPAFRPP")).toBeVisible();
    });

    test("shows country badge", async ({ page }) => {
        await page.goto("/institutions");
        await expect(page.locator("span[title='France']").first()).toBeVisible();
    });

    test("opens add institution form on button click", async ({ page }) => {
        await page.goto("/institutions");
        await page.getByRole("button", { name: "+ New institution" }).click();
        await expect(page.getByRole("heading", { name: "New institution" })).toBeVisible();
        await expect(page.getByRole("textbox", { name: "Institution name" })).toBeVisible();
        await expect(page.locator("#inst-country")).toBeVisible();
    });

    test("form has correct ARIA attributes", async ({ page }) => {
        await page.goto("/institutions");
        await page.getByRole("button", { name: "+ New institution" }).click();
        await expect(page.getByRole("textbox", { name: "Institution name" })).toHaveAttribute("aria-required", "true");
        await expect(page.locator("#inst-country")).toHaveAttribute("aria-required", "true");
    });

    test("cancels form and hides it", async ({ page }) => {
        await page.goto("/institutions");
        await page.getByRole("button", { name: "+ New institution" }).click();
        await expect(page.getByRole("heading", { name: "New institution" })).toBeVisible();
        await page.getByRole("button", { name: "Cancel" }).click();
        await expect(page.getByRole("heading", { name: "New institution" })).not.toBeVisible();
    });

    test("creates institution successfully", async ({ page }) => {
        await page.route("**/api/institutions", (route) => {
            if (route.request().method() === "POST") {
                return route.fulfill({
                    status: 201,
                    contentType: "application/json",
                    body: JSON.stringify({
                        id: "inst-3",
                        name: "Credit Agricole",
                        country: "FR",
                        type: "BANK",
                        bic: null,
                    }),
                });
            }
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(mockPageResult),
            });
        });
        await page.goto("/institutions");
        await page.getByRole("button", { name: "+ New institution" }).click();
        await page.getByRole("textbox", { name: "Institution name" }).fill("Credit Agricole");
        await page.locator("#inst-country").selectOption("FR");
        await page.getByRole("button", { name: "Create institution" }).click();
        await expect(page.getByRole("heading", { name: "New institution" })).not.toBeVisible();
    });

    test("shows error when creation fails", async ({ page }) => {
        await page.route("**/api/institutions", (route) => {
            if (route.request().method() === "POST") {
                return route.fulfill({
                    status: 409,
                    contentType: "application/json",
                    body: JSON.stringify({
                        message: "Institution already exists",
                    }),
                });
            }
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(mockPageResult),
            });
        });
        await page.goto("/institutions");
        await page.getByRole("button", { name: "+ New institution" }).click();
        await page.getByRole("textbox", { name: "Institution name" }).fill("BNP Paribas");
        await page.locator("#inst-country").selectOption("FR");
        await page.getByRole("button", { name: "Create institution" }).click();
        await expect(page.locator("[role='alert']").first()).toContainText("Institution already exists");
    });

    test("filter search field is accessible", async ({ page }) => {
        await page.goto("/institutions");
        await expect(page.getByRole("searchbox", { name: "Filter by institution name" })).toBeVisible();
        await expect(page.getByRole("combobox", { name: "Filter by country" })).toBeVisible();
    });

    test("institution list has list role for accessibility", async ({ page }) => {
        await page.goto("/institutions");
        await expect(page.getByRole("list", { name: "Institution list" })).toBeVisible();
    });

    test("new institution button is keyboard accessible", async ({ page }) => {
        await page.goto("/institutions");
        const button = page.getByRole("button", { name: "+ New institution" });
        await button.focus();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("heading", { name: "New institution" })).toBeVisible();
    });

    test("renders translated labels in French", async ({ page }) => {
        await mockUserProfile(page, "FRA");
        await page.goto("/institutions");
        await expect(page.getByRole("heading", { name: "Institutions" })).toBeVisible();
        await expect(page.getByRole("button", { name: "+ Nouvelle institution" })).toBeVisible();
        await expect(page.getByRole("searchbox", { name: "Filtrer par nom d'institution" })).toBeVisible();
        await page.getByRole("button", { name: "+ Nouvelle institution" }).click();
        await expect(page.getByRole("heading", { name: "Nouvelle institution" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Créer l'institution" })).toBeVisible();
    });
});
