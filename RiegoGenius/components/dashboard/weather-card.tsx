"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CloudSun, Droplets, Wind, Cloud, Thermometer } from "lucide-react"
import type { WeatherData } from "@/lib/types"
import { getWeatherDescription } from "@/lib/weather"

interface WeatherCardProps {
  weather: WeatherData | null
  loading?: boolean
}

export function WeatherCard({ weather, loading }: WeatherCardProps) {
  if (loading || !weather) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <CloudSun className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Clima Local
            </p>
            <p className="text-xs text-muted-foreground">
              {loading ? "Obteniendo clima..." : "Activa la ubicacion para ver el clima"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { current } = weather

  return (
    <Card className="border-border/50 bg-info/5">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Clima Local
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {current.temperature.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">
                °C
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {getWeatherDescription(current.weather_code)}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-info/10">
            <CloudSun className="h-7 w-7 text-info" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {current.humidity}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {current.wind_speed.toFixed(0)} km/h
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {current.cloud_cover}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
