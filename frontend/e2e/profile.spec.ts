import { test, expect } from "@playwright/test";

test.describe("Profile page", () => {
    test.beforeEach(async ({ page }) => {
        await page.route("**/api/users/me", route =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: "user-123",
                    firstName: "John",
                    lastName: "Doe",
                    displayName: "johndoe",
                    preferredCurrency: "EUR",
                    birthDate: null,
                }),
            })
        );
        await page.addInitScript(() => {
            localStorage.setItem("auth_token", "header.eyJzdWIiOiJ1c2VyLTEyMyJ9.signature");
            localStorage.setItem("user_id", "user-123");
        });
    });

    test("renders profile form with user data", async ({ page }) => {
        await page.goto("/profile");
        await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
        await expect(page.getByLabel("First name")).toHaveValue("John");
        await expect(page.getByLabel("Last name")).toHaveValue("Doe");
        await expect(page.getByLabel("Display name")).toHaveValue("johndoe");
    });

    test("submits updated preferences", async ({ page }) => {
        let putCalled = false;
        await page.route("**/api/users/me/preferences", route => {
            putCalled = true;
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: "user-123",
                    firstName: "Jane",
                    lastName: "Doe",
                    displayName: "janedoe",
                    preferredCurrency: "USD",
                    birthDate: null,
                }),
            });
        });

        await page.goto("/profile");
        await page.getByLabel("First name").fill("Jane");
        await page.getByLabel("Display name").fill("janedoe");
        await page.getByRole("button", { name: "Save changes" }).click();
        await page.waitForTimeout(500);
        expect(putCalled).toBe(true);
    });

    test("shows success message after save", async ({ page }) => {
        await page.route("**/api/users/me/preferences", route =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    id: "user-123",
                    firstName: "John",
                    lastName: "Doe",
                    displayName: "johndoe",
                    preferredCurrency: "EUR",
                    birthDate: null,
                }),
            })
        );
        await page.goto("/profile");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(page.getByRole("status")).toContainText("updated successfully");
    });

    test("profile form is keyboard navigable", async ({ page }) => {
        await page.goto("/profile");
        await page.getByLabel("First name").focus();
        await page.keyboard.press("Tab");
        await expect(page.getByLabel("Last name")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByLabel("Display name")).toBeFocused();
    });

    test("profile link is visible in sidebar", async ({ page }) => {
        await page.goto("/profile");
        await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Profile" })).toHaveAttribute("aria-current", "page");
    });
});