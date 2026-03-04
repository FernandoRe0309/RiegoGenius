// app/api/sensors/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apiGet, apiPost } from "@/lib/api-proxy"
import { getSensorStatus } from "@/lib/sensor-utils"
import type { SensorReading } from "@/lib/types"
import { SENSOR_CONFIGS } from "@/lib/constants"

export async function GET() {
  const { data, status } = await apiGet("/sensors/current")

  // FastAPI devuelve { readings: { temperature, soil_humidity, ... } }
  // El frontend espera { readings: SensorReading[] }
  const raw = data.readings as Record<string, number>
  const readings: SensorReading[] = (
    ["temperature", "air_humidity", "soil_humidity", "light", "co2"] as const
  ).map((type) => ({
    type,
    value: raw[type] ?? 0,
    unit: SENSOR_CONFIGS[type].unit,
    timestamp: new Date().toISOString(),
    status: getSensorStatus(type, raw[type] ?? 0),
  }))

  return NextResponse.json({ readings, source: data.source }, { status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, status } = await apiPost("/sensors/", body)
  return NextResponse.json(data, { status })
}
