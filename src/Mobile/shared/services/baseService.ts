import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, ApiResponse, ServiceResult } from "./models/baseServiceModels";
import { SessionService } from "./sessionServices";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// const token = AsyncStorage.getItem("jwt");

// TODO<Gabriel> pensar no que fazer quando o token expirar.

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
    const token = await SessionService.getJwtTokenAsync();
    const url = `${API_BASE_URL}${endpoint}`;

    console.log(url);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      // TODO<Gabriel> Continuar a partir daqui.
      // Acredito que tenha que existir AQUI, o serviço que verificar se a requisição foi 401.
      // Caso não for, prosseguir normalmente.
      // Se for, precisa fazer a requisição para o refresh token. E re-enviar esta requisição que falhou.

      if (!response) {
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
      console.error(`Falha na requisição POST para ${url}:`, error);
      const netError: ApiError = {
        statusCode: 0,
        message: (error as Error).message || "Falha de rede desconhecida",
      };

      return { success: false, error: netError };
    }
  },

  GetAsync: async <TResponse>(endpoint: string): Promise<ServiceResult<TResponse>> => {
    const token = await SessionService.getJwtTokenAsync();
    const url = `${API_BASE_URL}${endpoint}`;
console.log(url)
console.log(token)
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
};
