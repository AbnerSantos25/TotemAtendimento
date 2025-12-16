import React, { createContext, useState, useContext, useEffect } from 'react';
import { SessionService } from '../services/sessionServices'; // Seu serviço de Storage
import { BaseService } from '../services/baseService';       // Seu serviço de API
import { UserView} from '../models/commonModels'; // Seus models
import { AuthData } from '../models/baseServiceModels';

// O que o contexto vai oferecer para o app
interface AuthContextData {
  user: UserView | null;     // O usuário logado (ou null)
  isLoading: boolean;        // Se está carregando os dados do storage ao abrir o app
  signIn: (authData: AuthData) => Promise<void>; // Função para logar
  signOut: () => Promise<void>;                  // Função para deslogar
  refreshUser: () => Promise<void>;              // Função para atualizar dados do usuário manualmente
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ao abrir o app, tenta buscar o usuário salvo no celular
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await SessionService.getUserAsync();
        const storedToken = await SessionService.getJwtTokenAsync();

        if (storedUser && storedToken) {
          // Se tem usuário e token, restaura a sessão
          setUser(storedUser);
          
          // Opcional: Validar token na API aqui se quiser ser muito seguro
        }
      } catch (error) {
        console.log("Erro ao carregar sessão:", error);
      } finally {
        setIsLoading(false); // Libera o app (para de mostrar a tela de splash/loading)
      }
    }

    loadStorageData();
  }, []);

  // 2. Função chamada pela tela de Login após sucesso na API
  const signIn = async (authData: AuthData) => {
    console.log("Tentando logar com:", authData);
    try {
      // Salva no Storage (persistência)
      await SessionService.saveAuthDataAsync(authData);
      
      // Atualiza o estado em memória (Reatividade - isso atualiza a Home na hora!)
      setUser(authData.userView); 
    } catch (error) {
      console.log("Erro no signIn do contexto", error);
    }
  };

  // 3. Função de Logout
  const signOut = async () => {
    try {
      await SessionService.clearSessionAsync();
      setUser(null); // Ao setar null, a Home percebe na hora e muda a tela
    } catch (error) {
      console.log("Erro no signOut", error);
    }
  };

  // 4. Função auxiliar caso você queira recarregar os dados do usuário sem deslogar
  const refreshUser = async () => {
      // Implementar busca na API se necessário
      // const updatedUser = await ...
      // setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar o uso
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}