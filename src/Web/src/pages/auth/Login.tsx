import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/login-form";
import { GetLocalized } from "@/shared/localization/i18n";
import { Messages } from "@/shared/localization/keys";
export function Login() {
    const { isLoading, user } = useAuth();

    if (user) return <Navigate to="/home" replace />;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500">{GetLocalized(Messages.LoadingSystem)}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    );
}