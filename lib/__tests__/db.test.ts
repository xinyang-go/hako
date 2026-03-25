import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUsers = [
  {
    id: "1",
    username: "testuser",
    password: "testpass",
    email: "test@example.com",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    username: "anotheruser",
    password: "anotherpass",
    email: "another@example.com",
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

describe("db", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe("getUsers", () => {
    it("should return parsed users from file", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))

      const { getUsers } = await import("../db")
      const users = getUsers()

      expect(users).toEqual(mockUsers)
    })

    it("should return empty array on read error", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error("Read error")
      })

      const { getUsers } = await import("../db")
      const users = getUsers()

      expect(users).toEqual([])
    })
  })

  describe("getUserByUsername", () => {
    it("should find user by username", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))

      const { getUserByUsername } = await import("../db")
      const user = getUserByUsername("testuser")

      expect(user).toEqual(mockUsers[0])
    })

    it("should return undefined for non-existent username", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))

      const { getUserByUsername } = await import("../db")
      const user = getUserByUsername("nonexistent")

      expect(user).toBeUndefined()
    })
  })

  describe("getUserById", () => {
    it("should find user by id", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))

      const { getUserById } = await import("../db")
      const user = getUserById("2")

      expect(user).toEqual(mockUsers[1])
    })

    it("should return undefined for non-existent id", async () => {
      const { readFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))

      const { getUserById } = await import("../db")
      const user = getUserById("999")

      expect(user).toBeUndefined()
    })
  })

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { updateUser } = await import("../db")
      const updated = updateUser("1", { email: "newemail@example.com" })

      expect(updated).toBeDefined()
      expect(updated?.email).toBe("newemail@example.com")
    })

    it("should return null for non-existent user", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { updateUser } = await import("../db")
      const updated = updateUser("999", { email: "newemail@example.com" })

      expect(updated).toBeNull()
    })

    it("should throw error when updating username to existing username", async () => {
      const { readFileSync, writeFileSync } = await import("fs")
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockUsers))
      vi.mocked(writeFileSync).mockReturnValue(undefined)

      const { updateUser } = await import("../db")

      expect(() => updateUser("1", { username: "anotheruser" })).toThrow(
        "Username already exists"
      )
    })
  })
})
