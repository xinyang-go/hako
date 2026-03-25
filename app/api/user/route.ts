import { NextResponse } from "next/server"
import { getUserById, updateUser } from "@/lib/db"
import { verifyJWT, verifyPassword, hashPassword } from "@/lib/auth"
import type { UserWithoutPassword } from "@/types"

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { username, email, currentPassword, newPassword } =
      await request.json()
    const user = getUserById(payload.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (
      newPassword &&
      !(await verifyPassword(currentPassword, user.password))
    ) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const updates: Partial<typeof user> = {}
    if (username !== undefined) updates.username = username
    if (email !== undefined) updates.email = email
    if (newPassword) updates.password = await hashPassword(newPassword)

    const updatedUser = updateUser(payload.userId, updates)

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      )
    }

    const userWithoutPassword: UserWithoutPassword = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Update user error:", error)

    // Handle username already exists error
    if (error instanceof Error && error.message === "Username already exists") {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
