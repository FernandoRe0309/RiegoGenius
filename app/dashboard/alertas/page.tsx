"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SENSOR_CONFIGS } from "@/lib/constants"
import type { Alert, AlertSeverity } from "@/lib/types"
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; icon: typeof Info; className: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }
> = {
  info: {
    label: "Info",
    icon: Info,
    className: "border-info/30 bg-info/5",
    badgeVariant: "secondary",
  },
  warning: {
    label: "Advertencia",
    icon: AlertTriangle,
    className: "border-accent/30 bg-accent/5",
    badgeVariant: "outline",
  },
  critical: {
    label: "Critico",
    icon: XCircle,
    className: "border-destructive/30 bg-destructive/5",
    badgeVariant: "destructive",
  },
}

export default function AlertasPage() {
  const { data } = useSWR<{ alerts: Alert[] }>("/api/alerts", fetcher)

  const alerts = data?.alerts || []
  const active = alerts.filter((a) => !a.resolved)
  const resolved = alerts.filter((a) => a.resolved)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Notificaciones cuando los sensores se salen de los rangos configurados
          </p>
        </div>
        {active.length > 0 && (
          <Badge variant="destructive">{active.length} activa{active.length > 1 ? "s" : ""}</Badge>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Criticas</p>
              <p className="text-2xl font-bold text-foreground">
                {active.filter((a) => a.severity === "critical").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <AlertTriangle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Advertencias</p>
              <p className="text-2xl font-bold text-foreground">
                {active.filter((a) => a.severity === "warning").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-success/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resueltas</p>
              <p className="text-2xl font-bold text-foreground">
                {resolved.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active alerts */}
      {active.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {active.map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity]
                const SeverityIcon = config.icon
                const sensorLabel = SENSOR_CONFIGS[alert.sensor]?.label ?? alert.sensor

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${config.className}`}
                  >
                    <SeverityIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {alert.message}
                        </p>
                        <Badge variant={config.badgeVariant} className="ml-auto text-[10px]">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sensor: {sensorLabel} | {new Date(alert.timestamp).toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {active.length === 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Todo en orden
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                No hay alertas activas. Todos los sensores estan dentro de los rangos configurados.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved alerts */}
      {resolved.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Historial de alertas resueltas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {resolved.map((alert) => {
                const sensorLabel = SENSOR_CONFIGS[alert.sensor]?.label ?? alert.sensor

                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 opacity-70"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">
                        {alert.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Sensor: {sensorLabel} | {new Date(alert.timestamp).toLocaleString("es-MX")} - Resuelta
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
