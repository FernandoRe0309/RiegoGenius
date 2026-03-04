// app/api/alerts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apiGet } from "@/lib/api-proxy"
import type { Alert } from "@/lib/types"

/** Convierte AlertOut de FastAPI al tipo Alert del frontend */
function adaptAlert(a: Record<string, unknown>): Alert {
  return {
    id: String(a.id),
    // FastAPI usa "sensor_type", el frontend usa "sensor"
    sensor: (a.sensor_type as Alert["sensor"]),
    message: a.message as string,
    severity: (a.severity as Alert["severity"]),
    timestamp: (a.created_at as string),
    resolved: a.resolved as boolean,
  }
}

export async function GET(req: NextRequest) {
  const resolved = req.nextUrl.searchParams.get("resolved")
  const params: Record<string, string> = { limit: "100" }
  if (resolved !== null) params.resolved = resolved

  const { data, status } = await apiGet("/alerts/", params)
  const alerts: Alert[] = Array.isArray(data) ? data.map(adaptAlert) : []
  return NextResponse.json({ alerts }, { status })
}
