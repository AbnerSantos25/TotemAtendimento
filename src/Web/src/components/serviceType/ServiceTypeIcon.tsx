import { createElement } from "react";
import { DEFAULT_SERVICE_TYPE_ICON, resolveServiceTypeIcon } from "@/lib/serviceTypeIcons";

interface ServiceTypeIconProps {
    icon: string | null | undefined;
    className?: string;
}

// Nome de ícone do registro (ex.: "HeartPulse"); vazio ou desconhecido cai no ícone padrão
export function ServiceTypeIcon({ icon, className = "" }: ServiceTypeIconProps) {
    const resolved = (icon && resolveServiceTypeIcon(icon)) || DEFAULT_SERVICE_TYPE_ICON;
    // createElement: o ícone vem de um registro estático, não é um componente criado no render
    return createElement(resolved, { className: className || "h-4 w-4 text-muted-foreground" });
}
