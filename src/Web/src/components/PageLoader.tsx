import { Loader2 } from "lucide-react";
import { GetLocalized } from "@/shared/localization/i18n";
import { Messages } from "@/shared/localization/keys";

// Fallback do Suspense enquanto o chunk da página é baixado
export function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
    return (
        <div role="status" className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "py-24"}`}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="sr-only">{GetLocalized(Messages.Loading)}</span>
        </div>
    );
}
