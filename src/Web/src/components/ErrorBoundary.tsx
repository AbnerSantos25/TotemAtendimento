import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";

interface ErrorBoundaryProps {
    children: ReactNode;
    // Telas sem ninguém olhando (painel na TV) se recuperam sozinhas após esse tempo
    autoReloadMs?: number;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

// Evita que um erro de renderização deixe a tela inteira em branco
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };
    private reloadTimer?: number;

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Erro de renderização capturado pelo ErrorBoundary:", error, info.componentStack);

        if (this.props.autoReloadMs) {
            this.reloadTimer = window.setTimeout(() => window.location.reload(), this.props.autoReloadMs);
        }
    }

    componentWillUnmount() {
        window.clearTimeout(this.reloadTimer);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
                <TriangleAlert className="h-12 w-12 text-destructive" />
                <p className="text-lg font-semibold">{GetLocalized(Errors.UnexpectedError)}</p>
                {this.props.autoReloadMs && (
                    <p className="text-sm text-muted-foreground">{GetLocalized(Messages.AutoReloadNotice)}</p>
                )}
                <Button onClick={() => window.location.reload()}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> {GetLocalized(Labels.ReloadPage)}
                </Button>
            </div>
        );
    }
}
