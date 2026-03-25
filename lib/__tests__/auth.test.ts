import { describe, it, expect } from "vitest"
import { signJWT, verifyJWT, extractTokenFromHeader } from "../auth"

describe("auth", () => {
  describe("signJWT", () => {
    it("should sign a JWT token with correct payload", async () => {
      const payload = { userId: "123", username: "testuser" }
      const token = await signJWT(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3)
    })

    it("should produce different tokens for different payloads", async () => {
      const payload1 = { userId: "123", username: "user1" }
      const payload2 = { userId: "456", username: "user2" }

      const token1 = await signJWT(payload1)
      const token2 = await signJWT(payload2)

      expect(token1).not.toBe(token2)
    })
  })

  describe("verifyJWT", () => {
    it("should verify a valid JWT token", async () => {
      const payload = { userId: "123", username: "testuser" }
      const token = await signJWT(payload)

      const verified = await verifyJWT(token)

      expect(verified).toBeDefined()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.username).toBe(payload.username)
    })

    it("should return null for invalid token", async () => {
      const result = await verifyJWT("invalid.token.here")

      expect(result).toBeNull()
    })

    it("should return null for malformed token", async () => {
      const result = await verifyJWT("not-a-jwt")

      expect(result).toBeNull()
    })

    it("should return null for empty string", async () => {
      const result = await verifyJWT("")

      expect(result).toBeNull()
    })
  })

  describe("extractTokenFromHeader", () => {
    it("should extract token from valid Bearer header", () => {
      const token = extractTokenFromHeader("Bearer eyJhbGciOiJIUzI1NiJ9.test")

      expect(token).toBe("eyJhbGciOiJIUzI1NiJ9.test")
    })

    it("should return null for non-Bearer header", () => {
      const token = extractTokenFromHeader("Basic credentials")

      expect(token).toBeNull()
    })

    it("should return null for null header", () => {
      const token = extractTokenFromHeader(null)

      expect(token).toBeNull()
    })

    it("should return null for empty string", () => {
      const token = extractTokenFromHeader("")

      expect(token).toBeNull()
    })

    it("should handle Bearer with no token", () => {
      const token = extractTokenFromHeader("Bearer ")

      expect(token).toBe("")
    })
  })
})
