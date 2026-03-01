// GET /api/alerts - Lista de alertas
// POST /api/alerts - Actualizar umbrales

import { NextResponse } from "next/server"
import { generateAlerts } from "@/lib/mock-data"

export async function GET() {
  const alerts = generateAlerts()
  return NextResponse.json({ alerts })
}
