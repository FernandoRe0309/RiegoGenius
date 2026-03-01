import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">RiegoGenius</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Proyecto open-source para entusiastas del cultivo domestico. Licencia MIT.
        </p>

        <div className="flex gap-4">
          <a
            href="#funcionalidades"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Funcionalidades
          </a>
          <a
            href="#como-funciona"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Como funciona
          </a>
          <a
            href="#open-source"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Open Source
          </a>
        </div>
      </div>
    </footer>
  )
}
