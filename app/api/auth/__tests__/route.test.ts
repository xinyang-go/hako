import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  getUserByUsername: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}))

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual("@/lib/auth")
  return {
    ...actual,
    signJWT: vi.fn().mockResolvedValue("mocked-jwt-token"),
    verifyJWT: vi.fn(),
  }
})

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("POST /api/auth", () => {
    it("should return 400 when username is missing", async () => {
      const { POST } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "POST",
        body: JSON.stringify({ password: "test" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Username and password are required")
    })

    it("should return 400 when password is missing", async () => {
      const { POST } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "POST",
        body: JSON.stringify({ username: "test" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Username and password are required")
    })

    it("should return 401 for invalid credentials", async () => {
      const { getUserByUsername } = await import("@/lib/db")
      vi.mocked(getUserByUsername).mockReturnValue(undefined)

      const { POST } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "POST",
        body: JSON.stringify({ username: "wrong", password: "wrong" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("Invalid credentials")
    })

    it("should return token and user on successful login", async () => {
      const mockUser = {
        id: "1",
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }
      const { getUserByUsername } = await import("@/lib/db")
      vi.mocked(getUserByUsername).mockReturnValue(mockUser)

      const { POST } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "admin123" }),
        headers: { "Content-Type": "application/json" },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.token).toBe("mocked-jwt-token")
      expect(data.user.username).toBe("admin")
      expect(data.user.password).toBeUndefined()
    })
  })

  describe("DELETE /api/auth", () => {
    it("should return success on logout", async () => {
      const { DELETE } = await import("@/app/api/auth/route")
      const response = await DELETE()

      expect(response.status).toBe(200)
    })
  })

  describe("GET /api/auth", () => {
    it("should return 401 when no token provided", async () => {
      const { GET } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "GET",
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("No token provided")
    })

    it("should return 401 for invalid token", async () => {
      const { verifyJWT } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue(null)

      const { GET } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "GET",
        headers: { Authorization: "Bearer invalid-token" },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("Invalid token")
    })

    it("should return user for valid token", async () => {
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
      const { getUserByUsername } = await import("@/lib/db")
      vi.mocked(getUserByUsername).mockReturnValue(mockUser)

      const { GET } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "GET",
        headers: { Authorization: "Bearer valid-token" },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.username).toBe("admin")
      expect(data.user.password).toBeUndefined()
    })

    it("should return 404 when user not found", async () => {
      const { verifyJWT } = await import("@/lib/auth")
      vi.mocked(verifyJWT).mockResolvedValue({
        userId: "1",
        username: "admin",
        iat: 0,
        exp: 0,
      })

      const { getUserByUsername } = await import("@/lib/db")
      vi.mocked(getUserByUsername).mockReturnValue(undefined)

      const { GET } = await import("@/app/api/auth/route")
      const request = new Request("http://localhost/api/auth", {
        method: "GET",
        headers: { Authorization: "Bearer valid-token" },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe("User not found")
    })
  })
})
