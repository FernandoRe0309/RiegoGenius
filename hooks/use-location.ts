"use client"

import { useState, useEffect, useCallback } from "react"
import type { UserLocation } from "@/lib/types"

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalizacion")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: "Tu ubicacion",
        }

        // Intentar obtener nombre de ciudad via reverse geocoding
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${loc.lat.toFixed(2)},${loc.lon.toFixed(2)}&count=1&language=es`
          )
          // Open-Meteo no tiene reverse geocoding directo, usamos las coords
          loc.city = "Mi ubicacion"
        } catch {
          loc.city = "Mi ubicacion"
        }

        setLocation(loc)
        setLoading(false)
      },
      (err) => {
        setError("No se pudo obtener tu ubicacion. Busca tu ciudad manualmente.")
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [])

  const setManualLocation = useCallback((loc: UserLocation) => {
    setLocation(loc)
    setError(null)
  }, [])

  return { location, loading, error, detectLocation, setManualLocation }
}
