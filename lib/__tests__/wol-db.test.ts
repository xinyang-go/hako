import { describe, it, expect, vi, beforeEach } from "vitest"

const mockDevices = [
  {
    id: "1",
    name: "Test Device",
    macAddress: "AA:BB:CC:DD:EE:FF",
    broadcastAddress: "255.255.255.255",
    port: 9,
    description: "Test device description",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Another Device",
    macAddress: "11:22:33:44:55:66",
    broadcastAddress: "192.168.1.255",
    port: 7,
    description: "",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
]

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
}))

vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid-1234"),
}))

describe("wol-db", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe("getWOLDevices", () => {
    it("should return parsed devices from file", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))

      const { getWOLDevices } = await import("../wol-db")
      const devices = getWOLDevices()

      expect(devices).toEqual(mockDevices)
    })

    it("should return empty array on read error", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error("Read error")
      })

      const { getWOLDevices } = await import("../wol-db")
      const devices = getWOLDevices()

      expect(devices).toEqual([])
    })
  })

  describe("getWOLDeviceById", () => {
    it("should find device by id", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))

      const { getWOLDeviceById } = await import("../wol-db")
      const device = getWOLDeviceById("1")

      expect(device).toEqual(mockDevices[0])
    })

    it("should return undefined for non-existent id", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))

      const { getWOLDeviceById } = await import("../wol-db")
      const device = getWOLDeviceById("999")

      expect(device).toBeUndefined()
    })
  })

  describe("createWOLDevice", () => {
    it("should create a new device with defaults", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify([]))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { createWOLDevice } = await import("../wol-db")
      const device = createWOLDevice({
        name: "New Device",
        macAddress: "aa:bb:cc:dd:ee:ff",
      })

      expect(device.id).toBe("test-uuid-1234")
      expect(device.name).toBe("New Device")
      expect(device.macAddress).toBe("AA:BB:CC:DD:EE:FF")
      expect(device.broadcastAddress).toBe("255.255.255.255")
      expect(device.port).toBe(9)
    })

    it("should create a new device with custom values", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify([]))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { createWOLDevice } = await import("../wol-db")
      const device = createWOLDevice({
        name: "Custom Device",
        macAddress: "11-22-33-44-55-66",
        broadcastAddress: "192.168.1.255",
        port: 7,
        description: "Custom description",
      })

      expect(device.macAddress).toBe("11:22:33:44:55:66")
      expect(device.broadcastAddress).toBe("192.168.1.255")
      expect(device.port).toBe(7)
      expect(device.description).toBe("Custom description")
    })
  })

  describe("updateWOLDevice", () => {
    it("should update device successfully", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { updateWOLDevice } = await import("../wol-db")
      const updated = updateWOLDevice("1", { name: "Updated Name" })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe("Updated Name")
    })

    it("should format MAC address on update", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { updateWOLDevice } = await import("../wol-db")
      const updated = updateWOLDevice("1", { macAddress: "11-22-33-44-55-66" })

      expect(updated?.macAddress).toBe("11:22:33:44:55:66")
    })

    it("should return null for non-existent device", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { updateWOLDevice } = await import("../wol-db")
      const updated = updateWOLDevice("999", { name: "Updated Name" })

      expect(updated).toBeNull()
    })
  })

  describe("deleteWOLDevice", () => {
    it("should delete device successfully", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { deleteWOLDevice } = await import("../wol-db")
      const deleted = deleteWOLDevice("1")

      expect(deleted).toBe(true)
    })

    it("should return false for non-existent device", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockDevices))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { deleteWOLDevice } = await import("../wol-db")
      const deleted = deleteWOLDevice("999")

      expect(deleted).toBe(false)
    })
  })
})
