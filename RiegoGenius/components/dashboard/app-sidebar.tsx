"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Gauge,
  CloudSun,
  Brain,
  Droplets,
  Bell,
  History,
  Settings,
  Leaf,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  {
    title: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sensores",
    href: "/dashboard/sensores",
    icon: Gauge,
  },
  {
    title: "Clima Local",
    href: "/dashboard/clima",
    icon: CloudSun,
  },
  {
    title: "Predicciones IA",
    href: "/dashboard/predicciones",
    icon: Brain,
  },
  {
    title: "Riego",
    href: "/dashboard/riego",
    icon: Droplets,
  },
  {
    title: "Alertas",
    href: "/dashboard/alertas",
    icon: Bell,
  },
  {
    title: "Historial",
    href: "/dashboard/historial",
    icon: History,
  },
  {
    title: "Configuracion",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Leaf className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">
              RiegoGenius
            </span>
            <span className="text-[10px] text-sidebar-foreground/60">
              Monitoreo Inteligente
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
              Hardware
            </p>
            <p className="mt-1 text-xs text-sidebar-foreground/80">
              Raspberry Pi 400
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-[10px] text-sidebar-foreground/60">
                Datos simulados
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
