"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Power, Plus, Pencil, Trash2, Monitor, AlertCircle } from "lucide-react"
import type { WakeOnLANDevice, WakeOnLANDeviceInput } from "@/types"

export function WOLPage() {
  const [devices, setDevices] = useState<WakeOnLANDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<WakeOnLANDevice | null>(
    null
  )
  const [wakingDeviceId, setWakingDeviceId] = useState<string | null>(null)
  const [deleteDeviceId, setDeleteDeviceId] = useState<string | null>(null)
  const [formData, setFormData] = useState<WakeOnLANDeviceInput>({
    name: "",
    macAddress: "",
    broadcastAddress: "255.255.255.255",
    port: 9,
    description: "",
  })

  const fetchDevices = async () => {
    const token = localStorage.getItem("auth-token")
    if (!token) return

    try {
      const response = await fetch("/api/wol", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch devices")
      const data = await response.json()
      setDevices(data.devices)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const handleWake = async (device: WakeOnLANDevice) => {
    const token = localStorage.getItem("auth-token")
    if (!token) return

    setWakingDeviceId(device.id)
    try {
      const response = await fetch("/api/wol", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "wake", id: device.id }),
      })
      const result = await response.json()

      if (result.success) {
        toast.success(`Wake packet sent to ${device.name}`)
      } else {
        toast.error(`Failed to wake ${device.name}: ${result.error}`)
      }
    } catch (err) {
      toast.error(
        `Failed to wake ${device.name}: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setWakingDeviceId(null)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem("auth-token")
    if (!token) return

    try {
      const url = "/api/wol"
      const method = editingDevice ? "PUT" : "POST"
      const body = editingDevice
        ? { id: editingDevice.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to save device")
        return
      }

      toast.success(
        editingDevice
          ? "Device updated successfully"
          : "Device added successfully"
      )
      setDialogOpen(false)
      resetForm()
      fetchDevices()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save device")
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteDeviceId(id)
  }

  const handleDelete = async () => {
    if (!deleteDeviceId) return

    const token = localStorage.getItem("auth-token")
    if (!token) return

    try {
      const response = await fetch(`/api/wol?id=${deleteDeviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to delete device")
        return
      }

      toast.success("Device deleted successfully")
      fetchDevices()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete device"
      )
    } finally {
      setDeleteDeviceId(null)
    }
  }

  const openAddDialog = () => {
    setEditingDevice(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (device: WakeOnLANDevice) => {
    setEditingDevice(device)
    setFormData({
      name: device.name,
      macAddress: device.macAddress,
      broadcastAddress: device.broadcastAddress,
      port: device.port,
      description: device.description || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      macAddress: "",
      broadcastAddress: "255.255.255.255",
      port: 9,
      description: "",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wake on LAN</h1>
          <p className="text-muted-foreground">
            Manage and wake up devices on your network
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus data-icon="inline-start" />
          Add Device
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle data-icon="inline-start" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading devices...
          </CardContent>
        </Card>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <Monitor className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">No devices configured</p>
              <p className="text-sm text-muted-foreground">
                Add a device to get started with Wake on LAN
              </p>
            </div>
            <Button onClick={openAddDialog}>
              <Plus data-icon="inline-start" />
              Add Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {device.macAddress}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(device)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(device.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {device.description && (
                  <p className="text-sm text-muted-foreground">
                    {device.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {device.broadcastAddress}:{device.port}
                  </Badge>
                </div>
                <Button
                  onClick={() => handleWake(device)}
                  disabled={wakingDeviceId === device.id}
                  className="w-full"
                >
                  {wakingDeviceId === device.id ? (
                    "Waking..."
                  ) : (
                    <>
                      <Power data-icon="inline-start" />
                      Wake Up
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? "Edit Device" : "Add Device"}
            </DialogTitle>
            <DialogDescription>
              {editingDevice
                ? "Update the device configuration"
                : "Add a new device for Wake on LAN"}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Computer"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="macAddress">MAC Address *</FieldLabel>
              <Input
                id="macAddress"
                value={formData.macAddress}
                onChange={(e) =>
                  setFormData({ ...formData, macAddress: e.target.value })
                }
                placeholder="AA:BB:CC:DD:EE:FF"
              />
              <FieldDescription>
                Format: AA:BB:CC:DD:EE:FF or AABBCCDDEEFF
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="broadcastAddress">
                Broadcast Address
              </FieldLabel>
              <Input
                id="broadcastAddress"
                value={formData.broadcastAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    broadcastAddress: e.target.value,
                  })
                }
                placeholder="255.255.255.255"
              />
              <FieldDescription>
                Use 255.255.255.255 for global broadcast or subnet broadcast
                (e.g., 192.168.1.255)
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="port">Port</FieldLabel>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    port: parseInt(e.target.value) || 9,
                  })
                }
                placeholder="9"
              />
              <FieldDescription>
                Default: 9 (Discard Protocol). Common ports: 0, 7, 9
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Office desktop computer"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.macAddress}
            >
              {editingDevice ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteDeviceId}
        onOpenChange={() => setDeleteDeviceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this device? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
