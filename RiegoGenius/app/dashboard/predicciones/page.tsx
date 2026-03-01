"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PredictionCard } from "@/components/dashboard/prediction-card"
import { SENSOR_CONFIGS, SENSOR_ORDER, POLLING_INTERVAL } from "@/lib/constants"
import { predict } from "@/lib/ml-rules"
import type { SensorReading, WeatherData, Prediction } from "@/lib/types"
import { Brain, CheckCircle2, XCircle, Info, TrendingUp, Leaf } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PrediccionesPage() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocation({ lat: 19.43, lon: -99.13 })
      )
    } else {
      setLocation({ lat: 19.43, lon: -99.13 })
    }
  }, [])

  const { data: sensorData } = useSWR<{ readings: SensorReading[] }>(
    "/api/sensors",
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  )

  const { data: weatherData } = useSWR<WeatherData>(
    location ? `/api/weather?lat=${location.lat}&lon=${location.lon}` : null,
    fetcher,
    { refreshInterval: 600_000 }
  )

  const prediction: Prediction | null =
    sensorData?.readings ? predict(sensorData.readings, weatherData ?? null) : null

  const readings = sensorData?.readings || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Predicciones IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recomendaciones del modelo de Machine Learning basadas en sensores y clima
        </p>
      </div>

      {/* Main prediction */}
      <div className="grid gap-4 md:grid-cols-2">
        <PredictionCard prediction={prediction} loading={!sensorData} />

        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Detalles del Modelo
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Algoritmo</span>
                <Badge variant="secondary" className="text-[10px]">
                  Decision Tree
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Precision</span>
                <span className="text-xs font-medium text-foreground">84%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Datos de entrenamiento</span>
                <span className="text-xs font-medium text-foreground">500+ registros</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Variables de entrada</span>
                <span className="text-xs font-medium text-foreground">11 features</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Fuente de clima</span>
                <Badge variant="outline" className="text-[10px]">
                  Open-Meteo API
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Factors breakdown */}
      {prediction && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-primary" />
                Factores de Sensores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {prediction.factors.sensor_factors.map((factor, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-muted/50 p-3"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-xs text-foreground">{factor}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-info" />
                Factores Climaticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {prediction.factors.weather_factors.map((factor, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-info/5 p-3"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                    <span className="text-xs text-foreground">{factor}</span>
                  </div>
                ))}
                {prediction.factors.weather_factors.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3">
                    Sin datos climaticos disponibles. Las predicciones se basan
                    unicamente en los sensores.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current sensor values used for prediction */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Valores actuales usados en la prediccion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {SENSOR_ORDER.map((type) => {
              const reading = readings.find((r) => r.type === type)
              const config = SENSOR_CONFIGS[type]
              const value = reading?.value ?? 0
              const isOptimal =
                value >= config.optimalMin && value <= config.optimalMax

              return (
                <div
                  key={type}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    isOptimal
                      ? "border-success/30 bg-success/5"
                      : "border-accent/30 bg-accent/5"
                  }`}
                >
                  {isOptimal ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-accent" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {config.label}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {value.toFixed(1)} {config.unit}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* How it works explanation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Como funciona la prediccion
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            El modelo de Decision Tree fue entrenado con sklearn usando 500+
            registros sinteticos que simulan condiciones reales del cultivo de
            jitomate. Combina datos de 5 sensores (temperatura, humedad del aire
            y suelo, luz, CO2) con datos climaticos de Open-Meteo (temperatura
            exterior, probabilidad de lluvia, viento, nubosidad y pronostico a
            24h). Las reglas del arbol se exportaron como JavaScript para que las
            predicciones se ejecuten directamente en el navegador sin necesidad
            de un servidor Python.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
