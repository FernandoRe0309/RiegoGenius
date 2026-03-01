"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain, ArrowRight, Droplets, CloudRain } from "lucide-react"
import type { Prediction } from "@/lib/types"

interface PredictionCardProps {
  prediction: Prediction | null
  loading?: boolean
}

export function PredictionCard({ prediction, loading }: PredictionCardProps) {
  if (loading || !prediction) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Brain className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Prediccion IA
            </p>
            <p className="text-xs text-muted-foreground">Calculando...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const bg = prediction.should_irrigate ? "bg-info/10" : "bg-success/10"
  const Icon = prediction.should_irrigate ? Droplets : CloudRain

  return (
    <Card className={`border-border/50 ${bg}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              prediction.should_irrigate ? "bg-info/20" : "bg-success/20"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                prediction.should_irrigate ? "text-info" : "text-success"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Prediccion IA
              </p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {Math.round(prediction.confidence * 100)}% confianza
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              {prediction.should_irrigate ? "Se recomienda regar" : "No es necesario regar"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {prediction.recommendation}
            </p>

            {/* Factors */}
            <div className="mt-3 flex flex-col gap-1">
              {prediction.factors.sensor_factors.slice(0, 2).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{f}</span>
                </div>
              ))}
              {prediction.factors.weather_factors.slice(0, 1).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
