import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels } from "@/shared/localization/keys";

// Menu de 3 pontos da coluna de ações; os itens (DropdownMenuItem) vêm como children
export function RowActionsMenu({ children }: { children: ReactNode }) {
    return (
        // modal={false}: evita o body ficar com pointer-events travado ao abrir um Dialog a partir do menu
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground data-[state=open]:bg-muted"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">{GetLocalized(Labels.Actions)}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
