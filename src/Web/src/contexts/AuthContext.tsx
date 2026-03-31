import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { session } from '../services/StorageService';
import { authService } from '../services/AuthServices/AuthService';
import type { UserView, AuthData } from '@/models/AuthModels';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: UserView | null;
    isLoading: boolean;
    signIn: (authData: AuthData) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserView | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const loadSession = async () => {
            try {
                const sessionUser = await session.getUserAsync();
                const token = await session.getJwtTokenAsync();

                if (sessionUser && token) {
                    const extractedRoles = extractRolesFromToken(token);

                    if (isMounted) {
                        setUser({
                            ...sessionUser,
                            roles: extractedRoles
                        });
                    }
                }
            } catch (error) {
                console.log("Falha ao inicializar o estado de autenticação:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        const handleSessionExpired = () => {
            if (isMounted) {
                console.log("Evento onSessionExpired recebido. Limpando AuthContext.");
                setUser(null);
            }
        };

        loadSession();

        window.addEventListener('onSessionExpired', handleSessionExpired);

        return () => {
            isMounted = false;
            window.removeEventListener('onSessionExpired', handleSessionExpired);
        };
    }, []);

    const signIn = async (authData: AuthData): Promise<void> => {
        await session.saveAuthDataAsync(authData);

        const userRole = extractRolesFromToken(authData.jwt);

        const completeUser: UserView = {
            ...authData.userView,
            roles: userRole
        };

        setUser(completeUser);
        console.log("Usuário logado com a Role extraída do Token:", completeUser);
    };

    const signOut = async (): Promise<void> => {
        if (user) {
            try {
                await authService.logoutAsync(user.id);
            } catch (error) {
                console.error("Erro ao revogar token no logout:", error);
            }
        }
        await session.clearSessionAsync();
        setUser(null);
    };

    const refreshUser = async (): Promise<void> => {
    };

    const value: AuthContextType = {
        user,
        isLoading,
        signIn,
        signOut,
        refreshUser,
    };

    function extractRolesFromToken(token: string): string[] {
        try {
            const decoded: any = jwtDecode(token);

            const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

            const decodedRoles = decoded[roleClaim];

            if (!decodedRoles) return [];

            return Array.isArray(decodedRoles) ? decodedRoles : [decodedRoles];

        } catch (error) {
            console.log("Erro ao decodificar token", error);
            return [];
        }
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
