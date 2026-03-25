import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"
import type { WakeOnLANDevice, WakeOnLANDeviceInput } from "@/types"

const DATA_DIR = join(process.cwd(), "data")
const WOL_FILE = join(DATA_DIR, "wol-devices.json")

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

if (!existsSync(WOL_FILE)) {
  writeFileSync(WOL_FILE, JSON.stringify([], null, 2))
}

export function getWOLDevices(): WakeOnLANDevice[] {
  try {
    const data = readFileSync(WOL_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function getWOLDeviceById(id: string): WakeOnLANDevice | undefined {
  const devices = getWOLDevices()
  return devices.find((d) => d.id === id)
}

export function createWOLDevice(
  input: WakeOnLANDeviceInput
): WakeOnLANDevice {
  const devices = getWOLDevices()
  const now = new Date().toISOString()
  
  const newDevice: WakeOnLANDevice = {
    id: randomUUID(),
    name: input.name,
    macAddress: input.macAddress.toUpperCase().replace(/[:-]/g, ":"),
    broadcastAddress: input.broadcastAddress || "255.255.255.255",
    port: input.port || 9,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  }
  
  devices.push(newDevice)
  writeFileSync(WOL_FILE, JSON.stringify(devices, null, 2))
  return newDevice
}

export function updateWOLDevice(
  id: string,
  input: Partial<WakeOnLANDeviceInput>
): WakeOnLANDevice | null {
  const devices = getWOLDevices()
  const index = devices.findIndex((d) => d.id === id)
  
  if (index === -1) return null
  
  const updated: WakeOnLANDevice = {
    ...devices[index],
    ...input,
    macAddress: input.macAddress
      ? input.macAddress.toUpperCase().replace(/[:-]/g, ":")
      : devices[index].macAddress,
    updatedAt: new Date().toISOString(),
  }
  
  devices[index] = updated
  writeFileSync(WOL_FILE, JSON.stringify(devices, null, 2))
  return updated
}

export function deleteWOLDevice(id: string): boolean {
  const devices = getWOLDevices()
  const index = devices.findIndex((d) => d.id === id)
  
  if (index === -1) return false
  
  devices.splice(index, 1)
  writeFileSync(WOL_FILE, JSON.stringify(devices, null, 2))
  return true
}
