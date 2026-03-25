import { test, expect } from "@playwright/test"

test.describe("Monitoring Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Username").fill("admin")
    await page.getByLabel("Password").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await page.waitForURL(/\/system\/monitor/)
  })

  test("should display monitoring page with title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Server Monitoring" })
    ).toBeVisible()
    await expect(
      page.getByText("Real-time system performance metrics")
    ).toBeVisible()
  })

  test("should display system info card", async ({ page }) => {
    await expect(page.getByText("System Info")).toBeVisible()
    await expect(page.getByText("Hostname:")).toBeVisible()
    await expect(page.getByText("Platform:")).toBeVisible()
    await expect(page.getByText("Uptime:")).toBeVisible()
  })

  test("should display CPU load card", async ({ page }) => {
    await expect(page.getByText("CPU Load")).toBeVisible()
    await expect(page.getByText("Load Average")).toBeVisible()
  })

  test("should display memory usage card", async ({ page }) => {
    await expect(page.getByText("Memory Usage")).toBeVisible()
    await expect(page.getByText("Used Memory")).toBeVisible()
  })

  test("should display disk usage card", async ({ page }) => {
    await expect(page.getByText("Disk Usage")).toBeVisible()
    await expect(page.getByText("Used Disk")).toBeVisible()
  })

  test("should show metrics data after loading", async ({ page }) => {
    await page.waitForFunction(
      () => {
        const memoryText = document.body.innerText
        return memoryText.includes("MB /") && !memoryText.includes("- / -")
      },
      { timeout: 5000 }
    )
  })

  test("should auto-refresh metrics", async ({ page }) => {
    const initialTimestamp = await page.getByText(/Last updated:/).textContent()

    await page.waitForTimeout(3000)

    const newTimestamp = await page.getByText(/Last updated:/).textContent()
    expect(newTimestamp).not.toBe(initialTimestamp)
  })
})
