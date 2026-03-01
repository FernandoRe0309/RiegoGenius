// GET /api/irrigation - Estado del riego
// POST /api/irrigation - Activar/desactivar riego

import { NextRequest, NextResponse } from "next/server"
import { generateIrrigationStatus } from "@/lib/mock-data"

export async function GET() {
  const status = generateIrrigationStatus()
  return NextResponse.json(status)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { active } = body

  // En produccion, esto enviaria un comando al Raspberry Pi 400
  return NextResponse.json({
    success: true,
    active: !!active,
    message: active ? "Riego activado" : "Riego desactivado",
  })
}
