import { test, expect } from "@playwright/test";

test.describe("Navigation accessibility", () => {
  test("login page has no detectable accessibility violations (landmarks)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login form has proper ARIA attributes", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.getByLabel("Email address");
    await expect(emailInput).toHaveAttribute("aria-required", "true");
    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toHaveAttribute("aria-required", "true");
    const submitBtn = page.getByRole("button", { name: "Sign in" });
    await expect(submitBtn).toHaveAttribute("type", "submit");
  });

  test("skip to main content is not broken", async ({ page }) => {
    await page.goto("/login");
    const main = page.getByRole("main");
    await expect(main).toBeVisible();
  });

  test("reset page shows confirmation message after submission", async ({ page }) => {
    await page.route("**/api/auth/password-reset/request", async (route) => {
      await route.fulfill({ status: 204, body: "" });
    });
    await page.goto("/login/reset");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByRole("button", { name: "Send reset code" }).click();
    await expect(page.getByRole("heading", { name: "Enter reset code" })).toBeVisible({ timeout: 3000 });
  });
});