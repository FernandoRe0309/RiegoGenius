import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex flex-col items-center rounded-2xl bg-primary px-8 py-16 text-center lg:px-16">
          <h2 className="max-w-xl text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
            Empieza a monitorear tu cultivo hoy
          </h2>
          <p className="mt-4 max-w-md text-pretty text-primary-foreground/80">
            Sin cuentas, sin API keys, sin costos. Conecta tus sensores y deja
            que la inteligencia artificial haga el resto.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="gap-2 text-base"
            >
              <Link href="/dashboard">
                Abrir Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
