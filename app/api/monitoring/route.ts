import { NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import os from "os"
import { execSync } from "child_process"

function formatBytes(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100
}

function formatGB(bytes: number): number {
  return Math.round((bytes / 1024 / 1024 / 1024) * 100) / 100
}

function getDiskUsage() {
  try {
    const output = execSync("df -k /", { encoding: "utf-8" })
    const lines = output.trim().split("\n")

    if (lines.length >= 2) {
      const parts = lines[1].split(/\s+/)
      const totalKB = parseInt(parts[1], 10) || 0
      const usedKB = parseInt(parts[2], 10) || 0

      const totalBytes = totalKB * 1024
      const usedBytes = usedKB * 1024
      const percentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0

      return {
        used: formatGB(usedBytes),
        total: formatGB(totalBytes),
        percentage: Math.round(percentage * 100) / 100,
      }
    }

    throw new Error("Could not parse disk usage")
  } catch (error) {
    console.error("Error getting disk usage:", error)
    return {
      used: 0,
      total: 0,
      percentage: 0,
    }
  }
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

    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory

    const metrics = {
      cpuUsage: Math.round(os.loadavg()[0] * 100) / 100,
      memoryUsage: {
        used: formatBytes(usedMemory),
        total: formatBytes(totalMemory),
        percentage: Math.round((usedMemory / totalMemory) * 100 * 100) / 100,
      },
      diskUsage: getDiskUsage(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      platform: os.platform(),
      hostname: os.hostname(),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Monitoring error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
