export interface User {
  id: string
  username: string
  password: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface UserWithoutPassword {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface JWTPayload {
  userId: string
  username: string
  iat: number
  exp: number
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  diskUsage: {
    used: number
    total: number
    percentage: number
  }
  uptime: number
  loadAverage: number[]
  platform: string
  hostname: string
  timestamp: string
}

export interface UserUpdateData {
  username?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

export interface WakeOnLANDevice {
  id: string
  name: string
  macAddress: string
  broadcastAddress: string
  port: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface WakeOnLANDeviceInput {
  name: string
  macAddress: string
  broadcastAddress?: string
  port?: number
  description?: string
}
