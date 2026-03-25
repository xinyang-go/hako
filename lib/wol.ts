import { createSocket, Socket } from "dgram"
import type { WakeOnLANDevice } from "@/types"

export function createMagicPacket(macAddress: string): Buffer {
  const macParts = macAddress.replace(/[:-]/g, "").match(/.{2}/g)
  
  if (!macParts || macParts.length !== 6) {
    throw new Error("Invalid MAC address format")
  }
  
  const macBuffer = Buffer.from(macParts.map((hex) => parseInt(hex, 16)))
  
  const magicPacket = Buffer.alloc(102)
  
  for (let i = 0; i < 6; i++) {
    magicPacket[i] = 0xff
  }
  
  for (let i = 0; i < 16; i++) {
    macBuffer.copy(magicPacket, 6 + i * 6)
  }
  
  return magicPacket
}

export async function sendWOLPacket(
  device: WakeOnLANDevice
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    let socket: Socket | null = null
    
    try {
      const magicPacket = createMagicPacket(device.macAddress)
      socket = createSocket("udp4")
      
      socket.on("error", (err) => {
        if (socket) {
          socket.close()
        }
        resolve({ success: false, error: err.message })
      })
      
      socket.bind(() => {
        if (!socket) {
          resolve({ success: false, error: "Socket not available" })
          return
        }
        
        socket.setBroadcast(true)
        
        socket.send(
          magicPacket,
          0,
          magicPacket.length,
          device.port,
          device.broadcastAddress,
          (err) => {
            if (err) {
              resolve({ success: false, error: err.message })
            } else {
              resolve({ success: true })
            }
            socket?.close()
          }
        )
      })
    } catch (err) {
      if (socket) {
        socket.close()
      }
      resolve({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  })
}

export function isValidMacAddress(mac: string): boolean {
  const cleanMac = mac.replace(/[:-]/g, "")
  return /^[0-9A-Fa-f]{12}$/.test(cleanMac)
}

export function formatMacAddress(mac: string): string {
  const cleanMac = mac.replace(/[:-]/g, "").toUpperCase()
  return cleanMac.match(/.{2}/g)?.join(":") || mac
}
