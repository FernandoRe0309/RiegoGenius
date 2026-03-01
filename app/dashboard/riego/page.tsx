"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { IrrigationStatus } from "@/lib/types"
import {
  Droplets,
  Power,
  Clock,
  TrendingUp,
  Zap,
  Hand,
  Brain,
} from "lucide-react"
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const TRIGGER_LABELS: Record<string, { label: string; icon: typeof Zap }> = {
  manual: { label: "Manual", icon: Hand },
  automatic: { label: "Automatico", icon: Zap },
  ml_recommendation: { label: "IA", icon: Brain },
}

export default function RiegoPage() {
  const [toggling, setToggling] = useState(false)

  const { data: irrigation } = useSWR<IrrigationStatus>(
    "/api/irrigation",
    fetcher
  )

  async function toggleIrrigation(active: boolean) {
    setToggling(true)
    try {
      await fetch("/api/irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      })
      mutate("/api/irrigation")
    } catch {
      // Error silencioso en demo
    }
    setToggling(false)
  }

  const events = irrigation?.events || []

  // Chart data for daily usage (simulated)
  const usageData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      day: date.toLocaleDateString("es-MX", { weekday: "short" }),
      consumo: Math.round(400 + Math.random() * 600),
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Control de Riego</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Activa, desactiva y monitorea el sistema de riego automatico
        </p>
      </div>

      {/* Control panel + status */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Main toggle */}
        <Card className={`border-2 transition-colors ${
          irrigation?.active
            ? "border-primary bg-primary/5"
            : "border-border/50"
        }`}>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
              irrigation?.active
                ? "bg-primary/20"
                : "bg-muted"
            }`}>
              <Power className={`h-10 w-10 ${
                irrigation?.active ? "text-primary" : "text-muted-foreground"
              }`} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {irrigation?.active ? "Riego Activo" : "Riego Inactivo"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {irrigation?.active
                  ? "El agua esta fluyendo"
                  : "Presiona para activar manualmente"}
              </p>
            </div>
            <Switch
              checked={irrigation?.active ?? false}
              onCheckedChange={toggleIrrigation}
              disabled={toggling}
              className="scale-125"
            />
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Consumo de Hoy
              </h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {irrigation?.todayUsage ?? 0} ml
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Equivalente a ~{((irrigation?.todayUsage ?? 0) / 1000).toFixed(1)} litros
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Promedio semanal: 680 ml/dia</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Ultimo Riego
              </h3>
            </div>
            {irrigation?.lastEvent ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  {new Date(irrigation.lastEvent.startTime).toLocaleString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {irrigation.lastEvent.waterAmount} ml -{" "}
                  {TRIGGER_LABELS[irrigation.lastEvent.trigger]?.label ?? irrigation.lastEvent.trigger}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Sin eventos registrados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly consumption chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Consumo semanal (ml)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="consumo"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent events log */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Historial de eventos de riego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {events.map((event) => {
              const triggerInfo = TRIGGER_LABELS[event.trigger] ?? {
                label: event.trigger,
                icon: Zap,
              }
              const TriggerIcon = triggerInfo.icon

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <TriggerIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Riego {triggerInfo.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(event.startTime).toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px]">
                      {event.waterAmount} ml
                    </Badge>
                  </div>
                </div>
              )
            })}
            {events.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No hay eventos de riego registrados
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Raspberry Pi 400:</strong> En
            produccion, el control de riego se ejecuta directamente en tu
            Raspberry Pi 400, que activa la bomba sumergible de 3-5V a traves
            del modulo relevador cuando el modelo de ML o los umbrales lo
            indican.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
