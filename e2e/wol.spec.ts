import { test, expect } from "@playwright/test"

test.describe("Wake on LAN Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Username").fill("admin")
    await page.getByLabel("Password").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/system\/monitor/)
    await page.goto("/network/wol")
  })

  test("should display Wake on LAN page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Wake on LAN" })
    ).toBeVisible()
    await expect(
      page.getByText("Manage and wake up devices on your network")
    ).toBeVisible()
  })

  test("should show empty state or device list", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Add Device" }).first()
    ).toBeVisible()
  })

  test("should open add device dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Device" }).first().click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Add Device" })
    ).toBeVisible()
  })

  test("should validate required fields in add dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Device" }).first().click()

    const addButton = page.getByRole("button", { name: "Add" }).last()
    expect(await addButton.isDisabled()).toBe(true)
  })

  test("should add a new device", async ({ page }) => {
    const uniqueName = `Test Computer ${Date.now()}`
    await page.getByRole("button", { name: "Add Device" }).first().click()

    await page.getByLabel("Name *").fill(uniqueName)
    await page.getByLabel("MAC Address *").fill("11:22:33:44:55:66")

    await page.getByRole("button", { name: "Add" }).last().click()

    await expect(page.getByText("Device added successfully")).toBeVisible()
    await expect(page.getByText(uniqueName)).toBeVisible()
  })

  test("should show validation error for invalid MAC address", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add Device" }).first().click()

    await page.getByLabel("Name *").fill("Invalid Device")
    await page.getByLabel("MAC Address *").fill("invalid-mac")

    await page.getByRole("button", { name: "Add" }).last().click()

    await expect(page.getByText("Invalid MAC address format")).toBeVisible()
  })

  test("should navigate to WOL page", async ({ page }) => {
    await page.goto("/network/wol")
    await expect(
      page.getByRole("heading", { name: "Wake on LAN" })
    ).toBeVisible()
  })

  test("should display device form fields", async ({ page }) => {
    await page.getByRole("button", { name: "Add Device" }).first().click()

    await expect(page.getByLabel("Name *")).toBeVisible()
    await expect(page.getByLabel("MAC Address *")).toBeVisible()
    await expect(page.getByLabel("Broadcast Address")).toBeVisible()
    await expect(page.getByLabel("Port")).toBeVisible()
    await expect(page.getByLabel("Description")).toBeVisible()
  })

  test("should have default values in form", async ({ page }) => {
    await page.getByRole("button", { name: "Add Device" }).first().click()

    await expect(page.getByLabel("Broadcast Address")).toHaveValue(
      "255.255.255.255"
    )
    await expect(page.getByLabel("Port")).toHaveValue("9")
  })

  test("should close dialog on cancel", async ({ page }) => {
    await page.getByRole("button", { name: "Add Device" }).first().click()
    await expect(page.getByRole("dialog")).toBeVisible()

    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })

  test("should show delete confirmation dialog", async ({ page }) => {
    const uniqueName = `Delete Test ${Date.now()}`
    await page.getByRole("button", { name: "Add Device" }).first().click()
    await page.getByLabel("Name *").fill(uniqueName)
    await page.getByLabel("MAC Address *").fill("AA:BB:CC:DD:EE:FF")
    await page.getByRole("button", { name: "Add" }).last().click()
    await expect(page.getByText(uniqueName)).toBeVisible()

    const card = page
      .locator("div[data-slot='card']")
      .filter({ hasText: uniqueName })
    await card.getByRole("button").filter({ hasText: "" }).nth(1).click()

    await expect(
      page.getByRole("alertdialog").getByText("Delete Device")
    ).toBeVisible()
    await expect(
      page.getByText("Are you sure you want to delete this device?")
    ).toBeVisible()
  })

  test("should cancel delete", async ({ page }) => {
    const uniqueName = `Cancel Delete Test ${Date.now()}`
    await page.getByRole("button", { name: "Add Device" }).first().click()
    await page.getByLabel("Name *").fill(uniqueName)
    await page.getByLabel("MAC Address *").fill("11:22:33:44:55:66")
    await page.getByRole("button", { name: "Add" }).last().click()
    await expect(page.getByText(uniqueName)).toBeVisible()

    const card = page
      .locator("div[data-slot='card']")
      .filter({ hasText: uniqueName })
    await card.getByRole("button").filter({ hasText: "" }).nth(1).click()

    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cancel" })
      .click()

    await expect(page.getByRole("alertdialog")).not.toBeVisible()
    await expect(page.getByText(uniqueName)).toBeVisible()
  })

  test("should delete device", async ({ page }) => {
    const uniqueName = `Device To Delete ${Date.now()}`
    await page.getByRole("button", { name: "Add Device" }).first().click()
    await page.getByLabel("Name *").fill(uniqueName)
    await page.getByLabel("MAC Address *").fill("22:33:44:55:66:77")
    await page.getByRole("button", { name: "Add" }).last().click()
    await expect(page.getByText(uniqueName)).toBeVisible()

    const card = page
      .locator("div[data-slot='card']")
      .filter({ hasText: uniqueName })
    await card.getByRole("button").filter({ hasText: "" }).nth(1).click()

    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete" })
      .click()

    await expect(page.getByText("Device deleted successfully")).toBeVisible()
    await expect(page.getByText(uniqueName)).not.toBeVisible()
  })
})
