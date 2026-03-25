import { describe, it, expect } from "vitest"
import { createMagicPacket, isValidMacAddress, formatMacAddress } from "../wol"

describe("wol", () => {
  describe("createMagicPacket", () => {
    it("should create a valid magic packet", () => {
      const macAddress = "AA:BB:CC:DD:EE:FF"
      const packet = createMagicPacket(macAddress)

      expect(packet.length).toBe(102)

      for (let i = 0; i < 6; i++) {
        expect(packet[i]).toBe(0xff)
      }

      const expectedMac = Buffer.from([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff])
      for (let i = 0; i < 16; i++) {
        const offset = 6 + i * 6
        for (let j = 0; j < 6; j++) {
          expect(packet[offset + j]).toBe(expectedMac[j])
        }
      }
    })

    it("should handle MAC address without separators", () => {
      const macAddress = "AABBCCDDEEFF"
      const packet = createMagicPacket(macAddress)

      expect(packet.length).toBe(102)
      expect(packet[6]).toBe(0xaa)
      expect(packet[7]).toBe(0xbb)
    })

    it("should handle MAC address with dashes", () => {
      const macAddress = "AA-BB-CC-DD-EE-FF"
      const packet = createMagicPacket(macAddress)

      expect(packet.length).toBe(102)
      expect(packet[6]).toBe(0xaa)
      expect(packet[7]).toBe(0xbb)
    })

    it("should throw error for invalid MAC address", () => {
      expect(() => createMagicPacket("invalid")).toThrow(
        "Invalid MAC address format"
      )
      expect(() => createMagicPacket("AA:BB:CC")).toThrow(
        "Invalid MAC address format"
      )
      expect(() => createMagicPacket("")).toThrow("Invalid MAC address format")
    })
  })

  describe("isValidMacAddress", () => {
    it("should return true for valid MAC addresses with colons", () => {
      expect(isValidMacAddress("AA:BB:CC:DD:EE:FF")).toBe(true)
      expect(isValidMacAddress("00:11:22:33:44:55")).toBe(true)
      expect(isValidMacAddress("aa:bb:cc:dd:ee:ff")).toBe(true)
    })

    it("should return true for valid MAC addresses with dashes", () => {
      expect(isValidMacAddress("AA-BB-CC-DD-EE-FF")).toBe(true)
      expect(isValidMacAddress("00-11-22-33-44-55")).toBe(true)
    })

    it("should return true for valid MAC addresses without separators", () => {
      expect(isValidMacAddress("AABBCCDDEEFF")).toBe(true)
      expect(isValidMacAddress("001122334455")).toBe(true)
    })

    it("should return false for invalid MAC addresses", () => {
      expect(isValidMacAddress("invalid")).toBe(false)
      expect(isValidMacAddress("AA:BB:CC")).toBe(false)
      expect(isValidMacAddress("")).toBe(false)
      expect(isValidMacAddress("AA:BB:CC:DD:EE:GG")).toBe(false)
      expect(isValidMacAddress("AA:BB:CC:DD:EE:FF:00")).toBe(false)
    })
  })

  describe("formatMacAddress", () => {
    it("should format MAC address with colons", () => {
      expect(formatMacAddress("AABBCCDDEEFF")).toBe("AA:BB:CC:DD:EE:FF")
      expect(formatMacAddress("aabbccddeeff")).toBe("AA:BB:CC:DD:EE:FF")
      expect(formatMacAddress("AA-BB-CC-DD-EE-FF")).toBe("AA:BB:CC:DD:EE:FF")
      expect(formatMacAddress("aa:bb:cc:dd:ee:ff")).toBe("AA:BB:CC:DD:EE:FF")
    })

    it("should format partial input", () => {
      expect(formatMacAddress("invalid")).toBe("IN:VA:LI")
    })
  })
})
