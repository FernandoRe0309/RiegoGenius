"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SENSOR_CONFIGS } from "@/lib/constants"
import type { SensorHistoryPoint, SensorType } from "@/lib/types"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"

interface SensorChartProps {
  type: SensorType
  data: SensorHistoryPoint[]
  title?: string
  height?: number
  showOptimalRange?: boolean
}

export function SensorChart({
  type,
  data,
  title,
  height = 250,
  showOptimalRange = true,
}: SensorChartProps) {
  const config = SENSOR_CONFIGS[type]

  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: Number(point.value.toFixed(1)),
  }))

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {title || config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} ${config.unit}`, config.label]}
            />
            {showOptimalRange && (
              <>
                <ReferenceLine
                  y={config.optimalMin}
                  stroke="var(--color-success)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={config.optimalMax}
                  stroke="var(--color-success)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              fill={`url(#gradient-${type})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
