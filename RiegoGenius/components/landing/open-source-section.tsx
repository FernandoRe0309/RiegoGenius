import { Code, Users, Globe, Heart } from "lucide-react"

export function OpenSourceSection() {
  return (
    <section id="open-source" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
          <div className="grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
            {/* Left: Text */}
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Open Source
              </p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Hecho por y para la comunidad
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                RiegoGenius es un proyecto de codigo abierto pensado para
                entusiastas de la agricultura que quieren aprender, experimentar
                y compartir. No es una herramienta industrial cerrada: es tuya
                para adaptarla.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Code className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sin API Keys</p>
                    <p className="text-xs text-muted-foreground">
                      Clonas, instalas y funciona. Cero configuracion.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Para aficionados</p>
                    <p className="text-xs text-muted-foreground">
                      Lenguaje simple, sin jerga tecnica excesiva.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Forkeable</p>
                    <p className="text-xs text-muted-foreground">
                      Adaptalo a tu tipo de cultivo y comparte mejoras.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Gratuito</p>
                    <p className="text-xs text-muted-foreground">
                      Sin costos ocultos, sin suscripciones, siempre libre.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Code snippet */}
            <div className="flex items-center justify-center">
              <div className="w-full overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground">
                <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-accent/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-2 text-xs text-sidebar-foreground/60">terminal</span>
                </div>
                <div className="p-4 font-mono text-sm leading-relaxed">
                  <p className="text-sidebar-foreground/50">
                    {"# 1. Clonar el repositorio"}
                  </p>
                  <p className="text-sidebar-foreground">
                    <span className="text-success">$</span> git clone riegogenius.git
                  </p>
                  <p className="mt-3 text-sidebar-foreground/50">
                    {"# 2. Instalar dependencias"}
                  </p>
                  <p className="text-sidebar-foreground">
                    <span className="text-success">$</span> npm install
                  </p>
                  <p className="mt-3 text-sidebar-foreground/50">
                    {"# 3. Correr (sin configurar nada!)"}
                  </p>
                  <p className="text-sidebar-foreground">
                    <span className="text-success">$</span> npm run dev
                  </p>
                  <p className="mt-3 text-success">
                    {"-> Listo en http://localhost:3000"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
