import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/db", () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  getUserByUsername: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  verifyJWT: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn().mockResolvedValue("hashed:newpassword"),
}))

describe("User API", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe("PUT /api/user", () => {
    it("should return 401 when no token provided", async () => {
      const { PUT } = await import("@/app/api/user/route")
      const request = new Request("http://localhost/api/user", {
        method: "PUT",
        body: JSON.stringify({ email: "new@example.com" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("No token provided")
    })

    it("should return 401 for invalid token", async () => {
      const { verifyJWT } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue(null)

      const { PUT } = await import("@/app/api/user/route")
      const request = new Request("http://localhost/api/user", {
        method: "PUT",
        body: JSON.stringify({ email: "new@example.com" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token",
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("Invalid token")
    })

    it("should return 404 when user not found", async () => {
      const { verifyJWT } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue({
        userId: "1",
        username: "admin",
        iat: 0,
        exp: 0,
      })

      const { getUserById } = await import("@/lib/db")
      vi.mocked(getUserById).mockReturnValue(undefined)

      const { PUT } = await import("@/app/api/user/route")
      const request = new Request("http://localhost/api/user", {
        method: "PUT",
        body: JSON.stringify({ email: "new@example.com" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe("User not found")
    })

    it("should return 400 when current password is incorrect", async () => {
      const { verifyJWT, verifyPassword } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue({
        userId: "1",
        username: "admin",
        iat: 0,
        exp: 0,
      })
      vi.mocked(verifyPassword).mockResolvedValue(false)

      const mockUser = {
        id: "1",
        username: "admin",
        password: "hashed:password",
        email: "admin@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }
      const { getUserById } = await import("@/lib/db")
      vi.mocked(getUserById).mockReturnValue(mockUser)

      const { PUT } = await import("@/app/api/user/route")
      const request = new Request("http://localhost/api/user", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: "wrong",
          newPassword: "newpass123",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Current password is incorrect")
    })

    it("should update user successfully", async () => {
      const { verifyJWT } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue({
        userId: "1",
        username: "admin",
        iat: 0,
        exp: 0,
      })

      const mockUser = {
        id: "1",
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }
      const updatedUser = { ...mockUser, email: "new@example.com" }

      const { getUserById, updateUser } = await import("@/lib/db")
      vi.mocked(getUserById).mockReturnValue(mockUser)
      vi.mocked(updateUser).mockReturnValue(updatedUser)

      const { PUT } = await import("@/app/api/user/route")
      const request = new Request("http://localhost/api/user", {
        method: "PUT",
        body: JSON.stringify({ email: "new@example.com" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.email).toBe("new@example.com")
      expect(data.user.password).toBeUndefined()
    })

    it("should return 400 when username already exists", async () => {
      const { verifyJWT } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue({
        userId: "1",
        username: "admin",
        iat: 0,
        exp: 0,
      })

      const mockUser = {
        id: "1",
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }

      const { getUserById, updateUser } = await import("@/lib/db")
      vi.mocked(getUserById).mockReturnValue(mockUser)
      vi.mocked(updateUser).mockImplementation(() => {
        throw new Error("Username already exists")
      })

      const { PUT } = await import("@/app/api/user/route")
      const request = new Request("http://localhost/api/user", {
        method: "PUT",
        body: JSON.stringify({ username: "existinguser" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Username already exists")
    })
  })
})
