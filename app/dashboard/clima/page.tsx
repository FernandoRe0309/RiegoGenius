"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocation } from "@/hooks/use-location"
import type { WeatherData, GeocodingResult } from "@/lib/types"
import { searchCity, getWeatherDescription } from "@/lib/weather"
import { DAYS_SHORT_ES } from "@/lib/constants"
import {
  MapPin,
  Search,
  CloudSun,
  Droplets,
  Wind,
  Cloud,
  Thermometer,
  CloudRain,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ClimaPage() {
  const { location, loading: locLoading, error: locError, detectLocation, setManualLocation } = useLocation()
  const [citySearch, setCitySearch] = useState("")
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [searching, setSearching] = useState(false)

  const { data: weather, isLoading } = useSWR<WeatherData>(
    location ? `/api/weather?lat=${location.lat}&lon=${location.lon}` : null,
    fetcher,
    { refreshInterval: 600_000 }
  )

  async function handleSearch() {
    if (!citySearch.trim()) return
    setSearching(true)
    try {
      const results = await searchCity(citySearch)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    }
    setSearching(false)
  }

  function selectCity(result: GeocodingResult) {
    setManualLocation({
      lat: result.latitude,
      lon: result.longitude,
      city: result.name,
      country: result.country,
    })
    setSearchResults([])
    setCitySearch("")
  }

  // Prepare hourly chart data (next 24 hours)
  const hourlyData = (weather?.hourly || []).slice(0, 24).map((h) => ({
    time: new Date(h.time).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperatura: h.temperature,
    lluvia: h.precipitation_probability,
  }))

  // Prepare daily forecast
  const dailyData = (weather?.daily || []).map((d) => {
    const date = new Date(d.date)
    return {
      ...d,
      dayName: DAYS_SHORT_ES[date.getDay()],
      dayDate: date.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clima Local</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos meteorologicos de tu zona, combinados con tus sensores para
          predicciones mas precisas
        </p>
      </div>

      {/* Location picker */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Ubicacion
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar ciudad..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSearch}
                  disabled={searching}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={detectLocation}
              disabled={locLoading}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              {locLoading ? "Detectando..." : "Usar mi ubicacion"}
            </Button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-3 flex flex-col gap-1 rounded-lg border border-border bg-card p-2">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => selectCity(r)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{r.name}</span>
                  {r.admin1 && (
                    <span className="text-xs text-muted-foreground">
                      {r.admin1},
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {r.country}
                  </span>
                </button>
              ))}
            </div>
          )}

          {location && (
            <p className="mt-2 text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              {location.city || "Mi ubicacion"} ({location.lat.toFixed(2)},{" "}
              {location.lon.toFixed(2)})
            </p>
          )}
          {locError && (
            <p className="mt-2 text-xs text-destructive">{locError}</p>
          )}
        </CardContent>
      </Card>

      {weather && (
        <>
          {/* Current weather */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 bg-info/5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                  <Thermometer className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.current.temperature.toFixed(1)}°C
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humedad</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.current.humidity}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Wind className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Viento</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.current.wind_speed.toFixed(0)} km/h
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nubosidad</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.current.cloud_cover}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {getWeatherDescription(weather.current.weather_code)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 7 day forecast */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Pronostico 7 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-7">
                {dailyData.map((day, i) => (
                  <div
                    key={day.date}
                    className={`flex flex-col items-center rounded-lg border p-3 ${
                      i === 0
                        ? "border-primary/30 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {day.dayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {day.dayDate}
                    </span>
                    <CloudSun className="my-2 h-6 w-6 text-muted-foreground" />
                    <div className="flex gap-1 text-xs">
                      <span className="font-medium text-foreground">
                        {Math.round(day.temp_max)}°
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round(day.temp_min)}°
                      </span>
                    </div>
                    {day.precipitation_probability > 20 && (
                      <div className="mt-1 flex items-center gap-0.5">
                        <CloudRain className="h-3 w-3 text-info" />
                        <span className="text-[10px] text-info">
                          {day.precipitation_probability}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hourly charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Temperatura por hora (hoy)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} width={35} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="temperatura" stroke="var(--color-primary)" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Probabilidad de lluvia por hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} width={35} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="lluvia" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Info note */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Nota:</strong> Estos datos
                climaticos se combinan automaticamente con las lecturas de tus
                sensores para generar predicciones mas precisas. Por ejemplo, si
                el modelo detecta que va a llover manana, te recomendara no
                regar hoy aunque el suelo este algo seco.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {!weather && !isLoading && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <CloudSun className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Selecciona tu ubicacion
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Usa el boton "Usar mi ubicacion" o busca tu ciudad para ver el
                clima local
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
