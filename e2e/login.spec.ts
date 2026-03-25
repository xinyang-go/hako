import { test, expect } from "@playwright/test"

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  test("should display login form", async ({ page }) => {
    await expect(page.getByText("Welcome back")).toBeVisible()
    await expect(page.getByLabel("Username")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
  })

  test("should show validation error for empty fields", async ({ page }) => {
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByLabel("Username")).toHaveAttribute("required")
  })

  test("should login with valid credentials", async ({ page }) => {
    await page.getByLabel("Username").fill("admin")
    await page.getByLabel("Password").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL(/\/system\/monitor/)
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.getByLabel("Username").fill("admin")
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText("Invalid credentials")).toBeVisible()
  })

  test("should show loading state during login", async ({ page }) => {
    await page.getByLabel("Username").fill("admin")
    await page.getByLabel("Password").fill("admin123")

    const signInButton = page.getByRole("button", { name: "Sign in" })
    await signInButton.click()

    await expect(page.getByText("Signing in...")).toBeVisible()
  })
})
