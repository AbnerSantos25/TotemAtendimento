import React, { createContext, useState, useContext, useEffect } from 'react';
import { SessionService } from '../services/sessionServices';
import { UserView } from '../models/commonModels';
import { AuthData } from '../models/baseServiceModels';


interface AuthContextData {
  user: UserView | null;
  isLoading: boolean;
  signIn: (authData: AuthData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserView | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await SessionService.getUserAsync();
        const storedToken = await SessionService.getJwtTokenAsync();

        if (storedUser && storedToken) {

          setUser(storedUser);


        }
      } catch (error) {
        console.log("Erro ao carregar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);


  const signIn = async (authData: AuthData) => {
    console.log("Tentando logar com:", authData);
    try {

      await SessionService.saveAuthDataAsync(authData);


      setUser(authData.userView);
    } catch (error) {
      console.log("Erro no signIn do contexto", error);
    }
  };


  const signOut = async () => {
    try {
      await SessionService.clearSessionAsync();
      setUser(null);
    } catch (error) {
      console.log("Erro no signOut", error);
    }
  };

  const refreshUser = async () => {
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
};


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}