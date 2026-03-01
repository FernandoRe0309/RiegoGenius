import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  CloudSun,
  Brain,
  Droplets,
  Bell,
  GitFork,
} from "lucide-react"

const FEATURES = [
  {
    icon: Activity,
    title: "Monitoreo en Tiempo Real",
    description:
      "Visualiza temperatura, humedad, luz, CO2 y humedad del suelo directamente desde tus sensores.",
  },
  {
    icon: CloudSun,
    title: "Clima Local Integrado",
    description:
      "Datos meteorologicos de tu zona automaticamente, sin API keys ni configuracion. Powered by Open-Meteo.",
  },
  {
    icon: Brain,
    title: "Predicciones con IA",
    description:
      "Modelo de Machine Learning que combina datos de sensores y clima para recomendarte cuando regar.",
  },
  {
    icon: Droplets,
    title: "Riego Inteligente",
    description:
      "El sistema decide si regar basandose en la humedad del suelo y si va a llover. Ahorra hasta 35% de agua.",
  },
  {
    icon: Bell,
    title: "Alertas al Instante",
    description:
      "Recibe notificaciones cuando la temperatura, humedad o CO2 se salen de los rangos optimos.",
  },
  {
    icon: GitFork,
    title: "100% Open Source",
    description:
      "Codigo abierto, gratuito y facil de forkear. Adaptalo a tu cultivo, comparte mejoras con la comunidad.",
  },
]

export function Features() {
  return (
    <section id="funcionalidades" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Funcionalidades
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Todo lo que necesitas para tu cultivo
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Herramientas disenadas para entusiastas de la agricultura, no
            necesitas ser experto.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
