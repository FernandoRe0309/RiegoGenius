// GET /api/predictions - Prediccion ML basada en sensores + clima
// POST /api/predictions - Prediccion con datos manuales

import { NextRequest, NextResponse } from "next/server"
import { generateCurrentReadings } from "@/lib/mock-data"
import { predict } from "@/lib/ml-rules"
import { fetchWeather } from "@/lib/weather"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseFloat(searchParams.get("lat") || "19.43")
  const lon = parseFloat(searchParams.get("lon") || "-99.13")

  const sensors = generateCurrentReadings()

  let weather = null
  try {
    weather = await fetchWeather(lat, lon)
  } catch {
    // Si falla el clima, predice solo con sensores
  }

  const prediction = predict(sensors, weather)
  return NextResponse.json({ prediction, sensors, hasWeather: !!weather })
}
