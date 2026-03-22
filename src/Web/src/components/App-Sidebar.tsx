import * as React from "react"
import { GalleryVerticalEnd, PieChart, Home, Settings, Megaphone } from "lucide-react"
import { useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./Team-switcher"
import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavUser } from "./nav-user"
import { useAuth } from "@/hooks/useAuth"

const data = {
  user: {
    name: "Abner Santos",
    email: "abner@totem.com",
    avatar: "https://github.com/shadcn.png", // Temporário
  },
  teams: [
    {
      name: "Totem Admin",
      logo: GalleryVerticalEnd,
      plan: "Produção",
    },
  ],
  navMain: [
    {
      title: "Inicio",
      url: "/home",
      icon: Home,
      isActive: false,
    },
    {
      title: "Operação",
      url: "/operacao",
      icon: Megaphone,
      isActive: false,
      items: [
        { title: "Meu Guichê", url: "/operacao/guiche" },
      ],
    },
    {
      title: "Gestão & Cadastros",
      url: "/gestao",
      icon: Settings,
      isActive: false,
      items: [
        { title: "Filas", url: "/gestao/filas" },
        { title: "Locais de Atendimento", url: "/gestao/locais" },
        { title: "Tipos de Serviço", url: "/gestao/tipos-servico" },
        { title: "Usuários", url: "/gestao/usuarios" },
        { title: "Configurações", url: "/configurations", isActive: true },
      ],
    }
    // ... você pode adicionar mais menus aqui
  ],
  projects: [
    {
      name: "Relatórios",
      url: "/relatorios",
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const location = useLocation()

  const navMainWithActive = data.navMain.map((item) => ({
    ...item,
    isActive: location.pathname.startsWith(item.url) || item.isActive,
  }))

  const projectsWithActive = data.projects.map((item) => ({
    ...item,
    isActive: location.pathname.startsWith(item.url),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
        <NavProjects projects={projectsWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name || "Usuário",
          email: user?.email || "",
          avatar: user?.profileImageUrl || "https://github.com/shadcn.png"
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}