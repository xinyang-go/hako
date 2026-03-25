import { test, expect } from "@playwright/test"

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Username").fill("admin")
    await page.getByLabel("Password").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await page.waitForURL(/\/system\/monitor/)
    await page.goto("/system/setting")
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
  })

  test("should display settings page with title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
    await expect(
      page.getByText("Manage your account information")
    ).toBeVisible()
  })

  test("should display profile information card", async ({ page }) => {
    await expect(page.getByText("Profile Information")).toBeVisible()
    await expect(page.getByLabel("Username")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Save Changes" })
    ).toBeVisible()
  })

  test("should display change password card", async ({ page }) => {
    await expect(page.getByText("Change Password")).toBeVisible()
    await expect(page.getByLabel("Current Password")).toBeVisible()
    await expect(page.getByLabel("New Password")).toBeVisible()
    await expect(page.getByLabel("Confirm Password")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Update Password" })
    ).toBeVisible()
  })

  test("should show current user data in profile form", async ({ page }) => {
    await expect(page.getByLabel("Username")).toHaveValue("admin")
  })

  test("should show error when passwords do not match", async ({ page }) => {
    await page.getByLabel("Current Password").fill("admin123")
    await page.getByLabel("New Password").fill("newpass123")
    await page.getByLabel("Confirm Password").fill("different123")
    await page.getByRole("button", { name: "Update Password" }).click()

    await expect(page.getByText("New passwords do not match")).toBeVisible()
  })

  test("should show error when password is too short", async ({ page }) => {
    await page.getByLabel("Current Password").fill("admin123")
    await page.getByLabel("New Password").fill("short")
    await page.getByLabel("Confirm Password").fill("short")
    await page.getByRole("button", { name: "Update Password" }).click()

    await expect(
      page.getByText("Password must be at least 6 characters")
    ).toBeVisible()
  })

  test("should show error when current password is incorrect", async ({
    page,
  }) => {
    await page.getByLabel("Current Password").fill("wrongpassword")
    await page.getByLabel("New Password").fill("newpass123")
    await page.getByLabel("Confirm Password").fill("newpass123")
    await page.getByRole("button", { name: "Update Password" }).click()

    await expect(page.getByText("Current password is incorrect")).toBeVisible()
  })
})
