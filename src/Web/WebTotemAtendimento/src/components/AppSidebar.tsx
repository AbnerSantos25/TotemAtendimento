import { Avatar } from './avatar'
import {
    Sidebar,
    SidebarHeader,
    SidebarBody,
    SidebarFooter,
    SidebarItem,
    SidebarSection,
    SidebarSpacer,
} from './sidebar'

// Importação de ícones do Heroicons
import {
    HomeIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/20/solid'

export function AppSidebar() {
    return (
        <Sidebar>
            {/* CABEÇALHO (Sticky) - Ideal para Logos ou Pesquisa */}
            <SidebarHeader>
                <div className="flex items-center gap-3 mb-4 px-2">
                    {/* Using a placeholder avatar image since we don't have logo.svg */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm ring-1 ring-white/10">
                        <span className="font-semibold">M</span>
                    </div>
                    <span className="truncate text-sm font-semibold text-zinc-950 dark:text-white">A Minha App</span>
                </div>
            </SidebarHeader>

            {/* CORPO - Área com scroll onde fica a navegação */}
            <SidebarBody>
                <SidebarSection>
                    {/* Use a prop 'current' para indicar a página ativa */}
                    <SidebarItem href="/" current>
                        <HomeIcon />
                        <span className="ml-3 truncate">Página Inicial</span>
                    </SidebarItem>

                    <SidebarItem href="/dashboard">
                        <ChartBarIcon />
                        <span className="ml-3 truncate">Estatísticas</span>
                    </SidebarItem>
                </SidebarSection>

                {/* SidebarSpacer empurra o conteúdo seguinte para baixo, se necessário */}
                <SidebarSpacer />

                <SidebarSection>
                    <SidebarItem href="/definicoes">
                        <Cog6ToothIcon />
                        <span className="ml-3 truncate">Definições</span>
                    </SidebarItem>
                </SidebarSection>
            </SidebarBody>

            {/* RODAPÉ (Sticky) - Ideal para o Perfil de Utilizador */}
            <SidebarFooter>
                <SidebarSection className="mb-0 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <SidebarItem href="/perfil">
                        <Avatar src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" />
                        <span className="ml-3 truncate font-medium">O Meu Perfil</span>
                    </SidebarItem>
                    <SidebarItem href="/logout">
                        <ArrowRightOnRectangleIcon />
                        <span className="ml-3 truncate">Sair</span>
                    </SidebarItem>
                </SidebarSection>
            </SidebarFooter>
        </Sidebar>
    )
}
