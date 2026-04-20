import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { session } from '../services/StorageService';
import { authService } from '../services/AuthServices/AuthService';
import type { UserView } from '@/models/AuthModels';

interface AuthContextType {
    user: UserView | null;
    isLoading: boolean;
    signIn: (userView: UserView) => Promise<void>;
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
                // Tenta restaurar a sessão via cookie chamando o endpoint /me
                const result = await authService.getMeAsync();

                if (result.success && result.data && isMounted) {
                    const userView = result.data;
                    await session.saveUserAsync(userView);
                    setUser(userView);
                }
                // Se falhou (401, cookie expirado, etc), deixa user como null
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

    const signIn = async (userView: UserView): Promise<void> => {
        await session.saveUserAsync(userView);
        setUser(userView);
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
        const result = await authService.getMeAsync();
        if (result.success && result.data) {
            await session.saveUserAsync(result.data);
            setUser(result.data);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        signIn,
        signOut,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
