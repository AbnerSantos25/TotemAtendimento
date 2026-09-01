import { SidebarTrigger } from "@/components/ui/sidebar"
import { GetLocalized } from "@/shared/localization/i18n"
import { Labels } from "@/shared/localization/keys"

export function Header() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="font-semibold">{GetLocalized(Labels.DashboardTitle)}</h1>
        </header>
    )
}