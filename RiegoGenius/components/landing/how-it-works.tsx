import { Cable, MapPin, Sparkles } from "lucide-react"

const STEPS = [
  {
    number: "01",
    icon: Cable,
    title: "Conecta tu Raspberry Pi 400 y sensores",
    description:
      "Conecta el Arduino con los sensores al Raspberry Pi 400 por USB. El Pi lee los datos automaticamente y los envia al sistema.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "El sistema detecta tu clima local",
    description:
      "Automaticamente obtiene el pronostico del tiempo de tu zona usando geolocalizacion. Sin API keys, sin cuentas, sin configurar nada.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Recibe recomendaciones inteligentes",
    description:
      'El modelo de IA analiza sensores + clima y te dice exactamente cuando regar. Si va a llover manana, te dice "espera".',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Asi de facil
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            3 pasos y listo
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Disenado para que cualquier persona pueda empezar a monitorear su
            cultivo en minutos.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Connector line (desktop only) */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-px w-[calc(100%-6rem)] bg-border lg:block" />
              )}

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
