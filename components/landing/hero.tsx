import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Activity } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center lg:px-8 lg:py-32">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Leaf className="h-4 w-4" />
          <span>100% Open Source y Gratuito</span>
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Cultiva mas inteligente,{" "}
          <span className="text-primary">sin complicaciones</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Monitorea tu cultivo en tiempo real con sensores IoT, recibe
          predicciones basadas en inteligencia artificial y optimiza el riego
          usando datos climaticos de tu zona. Todo sin configuracion.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 text-base">
            <Link href="/dashboard">
              Ir al Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 text-base">
            <a href="#como-funciona">
              Ver como funciona
            </a>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8 sm:gap-16">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground sm:text-3xl">5</span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">Sensores en tiempo real</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground sm:text-3xl">84%</span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">Precision del modelo ML</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground sm:text-3xl">35%</span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">Ahorro de agua estimado</span>
          </div>
        </div>
      </div>
    </section>
  )
}
