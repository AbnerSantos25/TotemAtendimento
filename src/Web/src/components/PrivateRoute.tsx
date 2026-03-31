import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AGShowMessage } from "./AGShowMessage";

interface PrivateRouteProps {
    allowedRoles?: string[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const { user, isLoading } = useAuth();
    const hasShownMessage = useRef(false);

    if (!isLoading && user) {
        console.log("Usuário carregado na PrivateRoute:", user);
        console.log("Roles do usuário:", user.roles);
        console.log("Roles exigidas pela rota:", allowedRoles);
    }

    const hasPermission = !allowedRoles || allowedRoles.length === 0 ||
        (user?.roles && user.roles.some(userRole =>
            allowedRoles.some(allowed => allowed.toLowerCase() === userRole.toLowerCase())
        ));

    useEffect(() => {
        if (!isLoading && user && !hasPermission && !hasShownMessage.current) {
            AGShowMessage.warning({
                title: "Acesso Negado",
                description: "Seu perfil não tem permissão para acessar esta área."
            });
            hasShownMessage.current = true;
        }
    }, [isLoading, user, hasPermission]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500 animate-pulse">Verificando credenciais...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!hasPermission) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}