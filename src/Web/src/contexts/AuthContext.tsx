import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { session } from '../services/StorageService';
import type { UserView, AuthData } from '@/models/AuthModels';

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
                    if (isMounted) {
                        setUser(sessionUser);
                    }
                }
            } catch (error) {
                console.error("Falha ao inicializar o estado de autenticação:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadSession();

        return () => {
            isMounted = false;
        };
    }, []);

    const signIn = async (authData: AuthData): Promise<void> => {
        await session.saveAuthDataAsync(authData);
        setUser(authData.userView);
        console.log("user", user);
    };

    const signOut = async (): Promise<void> => {
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
