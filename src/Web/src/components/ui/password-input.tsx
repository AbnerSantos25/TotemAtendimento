import * as React from "react";
import { CircleHelp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const PASSWORD_RULES = [
    "Pelo menos 6 caracteres",
    "Pelo menos uma letra maiúscula (A-Z)",
    "Pelo menos uma letra minúscula (a-z)",
    "Pelo menos um número (0-9)",
    "Pelo menos um caractere especial (!@#$%...)",
];

type PasswordInputProps = React.ComponentProps<"input">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    return (
        <div className="relative flex items-center">
            <Input
                type="password"
                placeholder="••••••••"
                className={`pr-9 ${className ?? ""}`}
                {...props}
            />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger
                        type="button"
                        className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                    >
                        <CircleHelp className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-56 space-y-1 p-3">
                        <p className="font-semibold text-xs mb-1.5">Requisitos da senha:</p>
                        <ul className="space-y-1">
                            {PASSWORD_RULES.map((rule) => (
                                <li key={rule} className="flex items-start gap-1.5 text-xs">
                                    <span className="mt-0.5 shrink-0">•</span>
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
