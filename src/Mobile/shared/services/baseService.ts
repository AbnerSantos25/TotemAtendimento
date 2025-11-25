import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.103:50765/api"; // substituir por .env
const token = AsyncStorage.getItem("jwt"); 
// separar em um arquivo de models
// TODO<Gabriel> pensar no que fazer quando o token expirar.

interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
}
export interface ApiError {
  statusCode: number;
  message: string;
  body?: string;
  validationErrors?: Record<string, string[]>;
}

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: ApiError };

async function createApiErrorAsync(response: Response): Promise<ApiError> {
  let errorBodyText: string;
  let friendlyMessage: string;
  let validationErrors: Record<string, string[]> | undefined = undefined;

  try {
    errorBodyText = await response.text();
    
    try {
      const errorJson = JSON.parse(errorBodyText);

      if (errorJson.errors && typeof errorJson.errors === 'object' && !Array.isArray(errorJson.errors)) {
        
        validationErrors = errorJson.errors; 
        friendlyMessage = errorJson.title || "Erro.";
      
      } 

      else if (errorJson.errors && Array.isArray(errorJson.errors)) {
         friendlyMessage = errorJson.errors.join(', ');
      } 
     
      else {
        friendlyMessage = errorBodyText;
      }
    } catch (jsonError) {
       friendlyMessage = errorBodyText;
    }
    
  } catch (e) {
    errorBodyText = "Não foi possível ler o corpo do erro.";
    friendlyMessage = "Não foi possível ler o corpo do erro.";
  }

  return {
    statusCode: response.status,
    message: friendlyMessage,          
    body: errorBodyText,               
    validationErrors: validationErrors 
  };
}

export const BaseService = {
  PostAsync: async <TResponse, TRequest>(endpoint: string, body: TRequest): Promise<ServiceResult<TResponse>> => {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        
      });

      if (!response.ok) {
        console.log("Resposta nao ok!");
        const error = await createApiErrorAsync(response);
        return { success: false, error: error };
      }
      console.log("nao era pra estar aqui!");

      const result: ApiResponse<TResponse> = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.errors ? result.errors.join(", ") : JSON.stringify(result);
        return {
          success: false,
          error: {
            statusCode: 200,
            message: errorMessage,
            body: JSON.stringify(result),
          },
        };
      }
    } catch (error) {
      console.error(`Falha na requisição POST para ${url}:`);
      const netError: ApiError = {
        statusCode: 0,
        message: (error as Error).message || "Falha de rede desconhecida",
      };

      return { success: false, error: netError };
    }
  },

  GetAsync: async <TResponse>(endpoint: string): Promise<ServiceResult<TResponse>> => {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await createApiErrorAsync(response);
        return { success: false, error: error };
      }

      const result: ApiResponse<TResponse> = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.errors ? result.errors.join(", ") : JSON.stringify(result);
        return {
          success: false,
          error: {
            statusCode: 200,
            message: errorMessage,
            body: JSON.stringify(result),
          },
        };
      }
    } catch (error) {
      console.error(`Falha na requisição GET para ${url}:`, error);
      const netError: ApiError = {
        statusCode: 0,
        message: (error as Error).message || "Falha de rede desconhecida",
      };
      return { success: false, error: netError };
    }
  },


  PutAsync: async <TResponse, TRequest>(endpoint: string, body: TRequest): Promise<ServiceResult<TResponse>> => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // CORREÇÃO: Obter o token com await AQUI DENTRO
    const token = await AsyncStorage.getItem("jwt"); 

    try {
      const response = await fetch(url, {
        method: "PUT", // Mudança aqui
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await createApiErrorAsync(response);
        return { success: false, error: error };
      }

      const result: ApiResponse<TResponse> = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.errors ? result.errors.join(", ") : JSON.stringify(result);
        return {
          success: false,
          error: {
            statusCode: 200,
            message: errorMessage,
            body: JSON.stringify(result),
          },
        };
      }
    } catch (error) {
      console.error(`Falha na requisição PUT para ${url}:`);
      const netError: ApiError = {
        statusCode: 0,
        message: (error as Error).message || "Falha de rede desconhecida",
      };

      return { success: false, error: netError };
    }
  },
  // Você pode adicionar os métodos put, delete, etc. aqui
};
