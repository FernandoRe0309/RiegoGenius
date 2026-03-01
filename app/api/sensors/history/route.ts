// GET /api/sensors/history?type=temperature&hours=24
// Historico de sensores. Por defecto datos simulados.

import { NextRequest, NextResponse } from "next/server"
import { generateHistory } from "@/lib/mock-data"
import type { SensorType } from "@/lib/types"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = (searchParams.get("type") || "temperature") as SensorType
  const hours = parseInt(searchParams.get("hours") || "24", 10)

  const history = generateHistory(type, hours)
  return NextResponse.json({ type, hours, history })
}
