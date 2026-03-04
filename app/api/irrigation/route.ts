// app/api/irrigation/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apiGet, apiPost } from "@/lib/api-proxy"
import type { IrrigationStatus, IrrigationEvent } from "@/lib/types"

/** Convierte un IrrigationEventOut de FastAPI al IrrigationEvent del frontend */
function adaptEvent(e: Record<string, unknown>): IrrigationEvent {
  return {
    id: String(e.id),
    startTime: (e.started_at ?? e.startTime) as string,
    endTime: (e.ended_at ?? e.endTime) as string | undefined,
    trigger: (e.trigger ?? "manual") as IrrigationEvent["trigger"],
    waterAmount: e.flow_liters as number | undefined,
  }
}

/**
 * GET /api/irrigation
 * Llama a /irrigation/status + /irrigation/history y compone el IrrigationStatus
 * que espera el frontend.
 */
export async function GET() {
  const [{ data: statusData }, { data: historyData }] = await Promise.all([
    apiGet("/irrigation/status"),
    apiGet("/irrigation/history"),
  ])

  const events: IrrigationEvent[] = Array.isArray(historyData)
    ? historyData.map(adaptEvent)
    : []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = events.filter(
    (e) => new Date(e.startTime) >= todayStart
  )
  // Estimación de uso: 20 L/min por defecto
  const todayUsage = todayEvents.reduce((acc, e) => {
    const dur = e.endTime
      ? (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 60000
      : 0
    return acc + dur * 20
  }, 0)

  const irrigation: IrrigationStatus = {
    active: statusData.active ?? false,
    lastEvent: events[0],
    todayUsage: Math.round(todayUsage),
    events,
  }

  return NextResponse.json(irrigation)
}

/** POST /api/irrigation — activa o desactiva el riego */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, status } = await apiPost("/irrigation/toggle", {
    active: body.active,
    trigger: body.trigger ?? "manual",
    triggered_by: body.triggered_by ?? "user",
    zone: body.zone ?? "general",
  })

  // Devolver IrrigationStatus actualizado
  const irrigationRes = await GET()
  return irrigationRes
}
