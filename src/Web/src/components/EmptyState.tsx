import type { ReactNode } from "react";
import { FolderX } from "lucide-react";

export interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export function EmptyState({
    title,
    description,
    icon = <FolderX className="h-12 w-12 text-muted-foreground mb-4" />,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed my-2">
            {icon}
            <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
