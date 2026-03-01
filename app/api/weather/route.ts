// GET /api/weather?lat=19.43&lon=-99.13
// Proxy a Open-Meteo API. No requiere API key.
// Usamos un proxy para evitar posibles problemas de CORS y cachear respuestas.

import { NextRequest, NextResponse } from "next/server"
import { fetchWeather } from "@/lib/weather"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseFloat(searchParams.get("lat") || "19.43")
  const lon = parseFloat(searchParams.get("lon") || "-99.13")

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Coordenadas invalidas" },
      { status: 400 }
    )
  }

  try {
    const weather = await fetchWeather(lat, lon)
    return NextResponse.json(weather)
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo obtener el clima. Intenta de nuevo." },
      { status: 502 }
    )
  }
}
