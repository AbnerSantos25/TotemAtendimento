import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AGShowMessage } from "./AGShowMessage";
import { Role } from "@/models/UserModels";

interface PrivateRouteProps {
    allowedRoles?: Role[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const { user, isLoading } = useAuth();
    const hasShownMessage = useRef(false);

    const hasPermission = !allowedRoles || allowedRoles.length === 0 ? true :
        (user?.roles && user.roles.some((userRole: any) => {
            let roleNumeric = userRole;
            if (typeof userRole === "string") {
                if (Role && userRole in Role) {
                    roleNumeric = Role[userRole as keyof typeof Role];
                } else if (!isNaN(Number(userRole))) {
                    roleNumeric = Number(userRole);
                }
            }

            const isAllowed = allowedRoles.includes(roleNumeric);
            return isAllowed;
        }));

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