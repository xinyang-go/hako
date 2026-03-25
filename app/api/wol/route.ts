import { NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import {
  getWOLDevices,
  getWOLDeviceById,
  createWOLDevice,
  updateWOLDevice,
  deleteWOLDevice,
} from "@/lib/wol-db"
import { sendWOLPacket, isValidMacAddress } from "@/lib/wol"

async function authenticate(request: Request) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return { error: "No token provided", status: 401 }
  }

  const payload = await verifyJWT(token)
  if (!payload) {
    return { error: "Invalid token", status: 401 }
  }

  return { payload }
}

export async function GET(request: Request) {
  try {
    const auth = await authenticate(request)
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const device = getWOLDeviceById(id)
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 })
      }
      return NextResponse.json({ device })
    }

    const devices = getWOLDevices()
    return NextResponse.json({ devices })
  } catch (error) {
    console.error("WOL GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request)
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { action, id, ...deviceData } = body

    if (action === "wake") {
      if (!id) {
        return NextResponse.json(
          { error: "Device ID is required" },
          { status: 400 }
        )
      }

      const device = getWOLDeviceById(id)
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 })
      }

      const result = await sendWOLPacket(device)
      return NextResponse.json(result)
    }

    if (!deviceData.name || !deviceData.macAddress) {
      return NextResponse.json(
        { error: "Name and MAC address are required" },
        { status: 400 }
      )
    }

    if (!isValidMacAddress(deviceData.macAddress)) {
      return NextResponse.json(
        { error: "Invalid MAC address format" },
        { status: 400 }
      )
    }

    const device = createWOLDevice(deviceData)
    return NextResponse.json({ device }, { status: 201 })
  } catch (error) {
    console.error("WOL POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await authenticate(request)
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      )
    }

    if (updates.macAddress && !isValidMacAddress(updates.macAddress)) {
      return NextResponse.json(
        { error: "Invalid MAC address format" },
        { status: 400 }
      )
    }

    const device = updateWOLDevice(id, updates)
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    return NextResponse.json({ device })
  } catch (error) {
    console.error("WOL PUT error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticate(request)
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      )
    }

    const deleted = deleteWOLDevice(id)
    if (!deleted) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("WOL DELETE error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
