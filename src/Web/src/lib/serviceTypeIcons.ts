import {
    Activity, Briefcase, Calendar, CreditCard, FileText, HeartPulse,
    HelpCircle, LayoutGrid, Smartphone, Ticket, TriangleAlert, User,
    type LucideIcon,
} from "lucide-react";

/**
 * Registro fixo dos ícones disponíveis para tipos de serviço.
 * Imports nomeados (em vez de `import * as Icons`) permitem ao bundler eliminar
 * os ~1.500 ícones do lucide-react que não são usados.
 *
 * Ao adicionar um ícone aqui, inclua-o também em AVAILABLE_ICONS (ServiceTypeFormDialog).
 */
export const SERVICE_TYPE_ICONS: Record<string, LucideIcon> = {
    LayoutGrid,
    User,
    Activity,
    Calendar,
    CreditCard,
    Briefcase,
    FileText,
    TriangleAlert,
    HeartPulse,
    HelpCircle,
    Smartphone,
    Ticket,
};

export const DEFAULT_SERVICE_TYPE_ICON: LucideIcon = LayoutGrid;

/** Retorna o ícone registrado ou undefined (hasOwn evita resolver "constructor", "toString" etc.). */
export const resolveServiceTypeIcon = (name: string): LucideIcon | undefined =>
    Object.hasOwn(SERVICE_TYPE_ICONS, name) ? SERVICE_TYPE_ICONS[name] : undefined;
