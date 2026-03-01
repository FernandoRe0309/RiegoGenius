"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SENSOR_CONFIGS, SENSOR_ORDER } from "@/lib/constants"
import { Thermometer, Droplets, Sprout, Sun, Wind } from "lucide-react"
import { useEffect, useState } from "react"

const ICONS = {
  Thermometer,
  Droplets,
  Sprout,
  Sun,
  Wind,
}

function generateValue(type: string): number {
  const ranges: Record<string, [number, number]> = {
    temperature: [20, 28],
    air_humidity: [60, 80],
    soil_humidity: [50, 72],
    light: [25000, 55000],
    co2: [380, 650],
  }
  const [min, max] = ranges[type] || [0, 100]
  return min + Math.random() * (max - min)
}

function formatVal(type: string, val: number): string {
  if (type === "light") return `${(val / 1000).toFixed(1)}k`
  if (type === "co2") return Math.round(val).toString()
  return val.toFixed(1)
}

export function SensorsPreview() {
  const [values, setValues] = useState<Record<string, number>>({})

  useEffect(() => {
    const initial: Record<string, number> = {}
    SENSOR_ORDER.forEach((type) => {
      initial[type] = generateValue(type)
    })
    setValues(initial)

    const interval = setInterval(() => {
      setValues((prev) => {
        const next = { ...prev }
        SENSOR_ORDER.forEach((type) => {
          const delta = (Math.random() - 0.5) * 2
          next[type] = (prev[type] || generateValue(type)) + delta
        })
        return next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Vista previa
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Datos en tiempo real de tus sensores
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Asi se ven los datos de tu cultivo en el dashboard. Estos valores se
            actualizan automaticamente.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SENSOR_ORDER.map((type) => {
            const config = SENSOR_CONFIGS[type]
            const IconComponent =
              ICONS[config.icon as keyof typeof ICONS] || Thermometer
            const val = values[type] ?? generateValue(type)

            return (
              <Card
                key={type}
                className="border-border/50 bg-card transition-all hover:shadow-md"
              >
                <CardContent className="flex flex-col items-center gap-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {config.label}
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-card-foreground">
                    {formatVal(type, val)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {config.unit}
                    </span>
                  </span>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{
                        width: `${Math.max(5, Math.min(100, ((val - config.min) / (config.max - config.min)) * 100))}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
