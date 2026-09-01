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

import { GetLocalized } from "@/shared/localization/i18n"
import { Labels } from "@/shared/localization/keys"

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
  get navMain() {
    return [
      {
        title: GetLocalized(Labels.NavigationHome),
        url: "/home",
        icon: Home,
        isActive: false,
      },
      {
        title: GetLocalized(Labels.NavigationOperation),
        url: "/operacao",
        icon: Megaphone,
        isActive: false,
        items: [
          { title: GetLocalized(Labels.NavigationMyCounter), url: "/meu-guiche" },
          { title: GetLocalized(Labels.NavigationPasswordPanel), url: "/painel-senhas" },
        ],
      },
      {
        title: GetLocalized(Labels.NavigationManagement),
        url: "/gestao",
        icon: Settings,
        isActive: false,
        items: [
          { title: GetLocalized(Labels.NavigationQueues), url: "/gestao/filas" },
          { title: GetLocalized(Labels.NavigationServiceLocations), url: "/gestao/locais" },
          { title: GetLocalized(Labels.NavigationServiceTypes), url: "/gestao/servicos" },
          { title: GetLocalized(Labels.NavigationUsers), url: "/gestao/usuarios" },
          { title: GetLocalized(Labels.NavigationSettings), url: "/configurations", isActive: true },
        ],
      }
    ]
  },
  get projects() {
    return [
      {
        name: GetLocalized(Labels.NavigationReports),
        url: "/relatorios",
        icon: PieChart,
      },
    ]
  }
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
          name: user?.name || GetLocalized(Labels.DefaultUser),
          email: user?.email || "",
          avatar: user?.profileImageUrl || "https://github.com/shadcn.png"
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}