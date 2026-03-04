// app/api/sensors/history/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apiGet } from "@/lib/api-proxy"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const { data, status } = await apiGet("/sensors/history", {
    sensor_type: sp.get("type") ?? "temperature",
    hours: sp.get("hours") ?? "24",
  })
  // FastAPI devuelve el array directo; el frontend espera { history: [...] }
  return NextResponse.json({ history: Array.isArray(data) ? data : data.history ?? [] }, { status })
}
