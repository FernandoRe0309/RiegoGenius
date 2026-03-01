// GET /api/sensors - Datos actuales de sensores
// En produccion, esto consultaria el Raspberry Pi 400 via Cloudflare Workers.
// Por defecto, genera datos simulados realistas.

import { NextResponse } from "next/server"
import { generateCurrentReadings } from "@/lib/mock-data"

export async function GET() {
  const readings = generateCurrentReadings()
  return NextResponse.json({ readings, source: "simulated" })
}
