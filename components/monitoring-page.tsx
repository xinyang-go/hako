"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Cpu, HardDrive, Database } from "lucide-react"
import type { SystemMetrics } from "@/types"

export function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem("auth-token")
      if (!token) return

      try {
        const response = await fetch("/api/monitoring", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Failed to fetch metrics")
        const data = await response.json()
        setMetrics(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return "bg-success"
    if (percentage < 80) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Server Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time system performance metrics
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Info</CardTitle>
            <Server className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hostname:</span>
              <span className="font-medium">{metrics?.hostname || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span className="font-medium">{metrics?.platform || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium">
                {metrics ? formatUptime(metrics.uptime) : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
            <Cpu className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Load Average</span>
                  <span>{metrics?.cpuUsage.toFixed(2) || "0.00"}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${getStatusColor(metrics?.cpuUsage || 0)}`}
                    style={{
                      width: `${Math.min(metrics?.cpuUsage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {metrics?.loadAverage.map((load, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold">{load.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {i === 0 ? "1m" : i === 1 ? "5m" : "15m"}
                    </div>
                  </div>
                )) || (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="text-center">
                        <div className="text-2xl font-bold">-</div>
                        <div className="text-xs text-muted-foreground">-</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Used Memory</span>
                  <span>
                    {metrics
                      ? `${metrics.memoryUsage.used} MB / ${metrics.memoryUsage.total} MB`
                      : "- / -"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${getStatusColor(metrics?.memoryUsage.percentage || 0)}`}
                    style={{
                      width: `${Math.min(metrics?.memoryUsage.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {metrics?.memoryUsage.percentage.toFixed(1) || "0.0"}% Used
                </Badge>
                <Badge variant="outline">
                  {metrics
                    ? `${(metrics.memoryUsage.total - metrics.memoryUsage.used).toFixed(2)} MB Free`
                    : "- MB Free"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Database className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Used Disk</span>
                  <span>
                    {metrics
                      ? `${metrics.diskUsage.used} GB / ${metrics.diskUsage.total} GB`
                      : "- / -"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${getStatusColor(metrics?.diskUsage.percentage || 0)}`}
                    style={{
                      width: `${Math.min(metrics?.diskUsage.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {metrics?.diskUsage.percentage.toFixed(1) || "0.0"}% Used
                </Badge>
                <Badge variant="outline">
                  {metrics
                    ? `${(metrics.diskUsage.total - metrics.diskUsage.used).toFixed(2)} GB Free`
                    : "- GB Free"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Last updated:{" "}
        {metrics?.timestamp
          ? new Date(metrics.timestamp).toLocaleString()
          : "Never"}
      </div>
    </div>
  )
}
