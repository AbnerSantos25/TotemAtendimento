import * as React from "react"
import { GalleryVerticalEnd, SquareTerminal, PieChart } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./team-switcher"
import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavUser } from "./NavUser"

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
            title: "Atendimentos",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                { title: "Fila Atual", url: "#" },
                { title: "Histórico", url: "#" },
            ],
        },
        // ... você pode adicionar mais menus aqui
    ],
    projects: [
        {
            name: "Relatórios",
            url: "#",
            icon: PieChart,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}