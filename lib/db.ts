import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { scryptSync, randomBytes } from "crypto"
import type { User } from "@/types"

const DATA_DIR = join(process.cwd(), "data")
const USERS_FILE = join(DATA_DIR, "users.json")

function hashPasswordSync(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString("hex")}`
}

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

if (!existsSync(USERS_FILE)) {
  const defaultUser: User = {
    id: "1",
    username: process.env.ADMIN_USERNAME || "admin",
    password: hashPasswordSync(process.env.ADMIN_PASSWORD || "admin123"),
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeFileSync(USERS_FILE, JSON.stringify([defaultUser], null, 2))
}

export function getUsers(): User[] {
  try {
    const data = readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function getUserByUsername(username: string): User | undefined {
  const users = getUsers()
  return users.find((u) => u.username === username)
}

export function getUserById(id: string): User | undefined {
  const users = getUsers()
  return users.find((u) => u.id === id)
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === id)

  if (index === -1) return null

  // Check if username is being updated and if it already exists
  if (updates.username && updates.username !== users[index].username) {
    const existingUser = getUserByUsername(updates.username)
    if (existingUser && existingUser.id !== id) {
      throw new Error("Username already exists")
    }
  }

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  return users[index]
}
