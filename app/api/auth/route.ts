import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/db"
import { signJWT, verifyJWT, verifyPassword } from "@/lib/auth"
import type { UserWithoutPassword } from "@/types"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    const user = getUserByUsername(username)

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const token = await signJWT({
      userId: user.id,
      username: user.username,
    })

    // Create response with user data
    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    const response = NextResponse.json({
      user: userWithoutPassword,
      token,
    })

    // Set auth cookie
    const requestUrl = new URL(request.url)
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: requestUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("auth-token")
  return response
}

export async function GET(request: Request) {
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

    const user = getUserByUsername(payload.username)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
