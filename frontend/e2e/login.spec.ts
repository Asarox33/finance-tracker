import { expect, test } from "@playwright/test";

test.describe("Auth flows", () => {
    test("login page renders correctly", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByRole("heading", { name: "Finance Tracker" })).toBeVisible();
        await expect(page.getByLabel("Email address")).toBeVisible();
        await expect(page.getByLabel("Password")).toBeVisible();
        await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Forgot password ?" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
    });

    test("login form is fully keyboard navigable", async ({ page }) => {
        await page.goto("/login");
        await page.keyboard.press("Tab"); // ThemeToggle (fixed, outside form)
        await page.keyboard.press("Tab"); // Email input
        await expect(page.getByLabel("Email address")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByLabel("Password")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "Sign in" })).toBeFocused();
    });

    test("login shows error on bad credentials", async ({ page }) => {
        await page.route("**/api/auth/login", (route) =>
            route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({ message: "Invalid credentials" }),
            })
        );
        await page.goto("/login");
        await page.getByLabel("Email address").fill("bad@example.com");
        await page.getByLabel("Password").fill("WrongPassword123!");
        await page.getByRole("button", { name: "Sign in" }).click();
        await expect(
            page.locator("[role='alert'][aria-live='assertive']:not(#__next-route-announcer__)")
        ).toContainText("Invalid credentials");
    });

    test("login shows locked warning on locked account", async ({ page }) => {
        await page.route("**/api/auth/login", (route) =>
            route.fulfill({
                status: 429,
                contentType: "application/json",
                body: JSON.stringify({
                    message: "Account is temporarily locked. Try again later.",
                }),
            })
        );
        await page.goto("/login");
        await page.getByLabel("Email address").fill("locked@example.com");
        await page.getByLabel("Password").fill("Password123!");
        await page.getByRole("button", { name: "Sign in" }).click();
        await expect(
            page.locator("[role='alert'][aria-live='assertive']:not(#__next-route-announcer__)")
        ).toContainText("locked");
        await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
    });

    test("register page renders correctly", async ({ page }) => {
        await page.goto("/login/register");
        await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
        await expect(page.getByLabel("Email address")).toBeVisible();
        await expect(page.getByLabel(/^Password/)).toBeVisible();
        await expect(page.getByLabel("Confirm password")).toBeVisible();
        await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    });

    test("register redirects to login on success", async ({ page }) => {
        await page.route("**/api/auth/register", (route) =>
            route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({ userId: "new-user-id" }),
            })
        );
        await page.goto("/login/register");
        await page.getByLabel("Email address").fill("new@example.com");
        await page
            .getByLabel(/^Password/)
            .first()
            .fill("MyStrongPassword123!");
        await page.getByLabel("Confirm password").fill("MyStrongPassword123!");
        await page.getByRole("button", { name: "Create account" }).click();
        await expect(page).toHaveURL(/\/login\?registered=1/, {
            timeout: 5000,
        });
    });

    test("reset request page renders correctly", async ({ page }) => {
        await page.goto("/login/reset");
        await expect(page.getByRole("heading", { name: "Reset password" })).toBeVisible();
        await expect(page.getByLabel("Email address")).toBeVisible();
        await expect(page.getByRole("button", { name: "Send reset code" })).toBeVisible();
    });

    test("reset shows confirm step after request", async ({ page }) => {
        await page.route("**/api/auth/password-reset/request", (route) => route.fulfill({ status: 204, body: "" }));
        await page.goto("/login/reset");
        await page.getByLabel("Email address").fill("test@example.com");
        await page.getByRole("button", { name: "Send reset code" }).click();
        await expect(page.getByRole("heading", { name: "Enter reset code" })).toBeVisible({ timeout: 3000 });
        await expect(page.getByLabel("6-digit code")).toBeVisible();
    });

    test("reset confirm shows done on success", async ({ page }) => {
        await page.route("**/api/auth/password-reset/request", (route) => route.fulfill({ status: 204, body: "" }));
        await page.route("**/api/auth/password-reset/confirm", (route) => route.fulfill({ status: 204, body: "" }));
        await page.goto("/login/reset");
        await page.getByLabel("Email address").fill("test@example.com");
        await page.getByRole("button", { name: "Send reset code" }).click();
        await expect(page.getByLabel("6-digit code")).toBeVisible({
            timeout: 3000,
        });
        await page.getByLabel("6-digit code").fill("123456");
        await page.getByLabel(/New password/).fill("NewPassword123!");
        await page.getByLabel("Confirm new password").fill("NewPassword123!");
        await page.getByRole("button", { name: "Reset password" }).click();
        await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible({ timeout: 3000 });
    });
});
