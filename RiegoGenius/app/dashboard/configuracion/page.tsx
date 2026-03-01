"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SENSOR_CONFIGS, SENSOR_ORDER, DEFAULT_THRESHOLDS } from "@/lib/constants"
import type { ThresholdConfig } from "@/lib/types"
import {
  Settings,
  Save,
  RotateCcw,
  Cpu,
  Wifi,
  Github,
  ExternalLink,
} from "lucide-react"

export default function ConfiguracionPage() {
  const [thresholds, setThresholds] = useState<ThresholdConfig[]>(
    DEFAULT_THRESHOLDS.map((t) => ({ ...t }))
  )
  const [saved, setSaved] = useState(false)

  function updateThreshold(sensor: string, field: "min" | "max", value: number) {
    setThresholds((prev) =>
      prev.map((t) =>
        t.sensor === sensor ? { ...t, [field]: value } : t
      )
    )
    setSaved(false)
  }

  function handleSave() {
    // En produccion, esto guardaria en la base de datos
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleReset() {
    setThresholds(DEFAULT_THRESHOLDS.map((t) => ({ ...t })))
    setSaved(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajusta los umbrales de alerta y la configuracion del sistema
        </p>
      </div>

      {/* Thresholds */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Umbrales de Alerta
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Define los rangos minimos y maximos para recibir alertas cuando un
            sensor se salga de estos valores.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {SENSOR_ORDER.map((type) => {
              const config = SENSOR_CONFIGS[type]
              const threshold = thresholds.find((t) => t.sensor === type)
              if (!threshold) return null

              const minInvalid = threshold.min >= threshold.max

              return (
                <div
                  key={type}
                  className={`rounded-lg border p-4 ${
                    minInvalid ? "border-destructive/50 bg-destructive/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {config.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Rango del sensor: {config.min} - {config.max} {config.unit} |
                        Optimo: {config.optimalMin} - {config.optimalMax} {config.unit}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {config.unit}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Minimo
                      </label>
                      <Input
                        type="number"
                        value={threshold.min}
                        onChange={(e) =>
                          updateThreshold(type, "min", parseFloat(e.target.value) || 0)
                        }
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Maximo
                      </label>
                      <Input
                        type="number"
                        value={threshold.max}
                        onChange={(e) =>
                          updateThreshold(type, "max", parseFloat(e.target.value) || 0)
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                  {minInvalid && (
                    <p className="mt-2 text-xs text-destructive">
                      El valor minimo no puede ser mayor o igual al maximo.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? "Guardado" : "Guardar Umbrales"}
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Cpu className="h-4 w-4" />
              Hardware
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">Dispositivo</span>
                <span className="text-xs font-medium text-foreground">
                  Raspberry Pi 400
                </span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">Microcontrolador</span>
                <span className="text-xs font-medium text-foreground">
                  Arduino UNO
                </span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">Sensores</span>
                <span className="text-xs font-medium text-foreground">
                  5 activos
                </span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">Bomba</span>
                <span className="text-xs font-medium text-foreground">
                  Sumergible 3-5V DC
                </span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">Comunicacion</span>
                <span className="text-xs font-medium text-foreground">
                  USB Serial + WiFi
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4" />
              Conexiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">API de Clima</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs font-medium text-foreground">
                    Open-Meteo
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">IoT Broker</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-xs font-medium text-foreground">
                    Cloudflare Workers
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">ML Backend</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-xs font-medium text-foreground">
                    FastAPI (Local)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">
                  ML en navegador
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs font-medium text-foreground">
                    Reglas JS exportadas
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open source note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-5">
          <Github className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Proyecto Open Source
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              RiegoGenius es un proyecto de codigo abierto. Puedes modificar los
              umbrales, agregar nuevos sensores, cambiar el modelo de ML o
              adaptar el sistema a tu cultivo especifico. Todo el codigo esta
              disponible en GitHub.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2 text-xs"
              asChild
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver en GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
