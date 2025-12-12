import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, ApiResponse, ServiceResult } from "../models/baseServiceModels";
import { SessionService } from "./sessionServices";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type RequestOptions = {
  requiresAuth?: boolean;
};

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

async function ensureTokenIsValid(currentToken: string): Promise<string | null> {
  try {
    const decoded: any = jwtDecode(currentToken);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime + 120) {

      const success = await SessionService.tryRefreshTokenAsync(false);

      if (success) {
        return await SessionService.getJwtTokenAsync();
      } else {
        console.error("Falha ao renovar token proativamente.");
        await SessionService.clearSessionAsync();
        return null;
      }
    }

    return currentToken;

  } catch (e) {
    console.error("Exception no ensureTokenIsValid", e);
    return null;
  }
}
export const BaseService = {

  _request: async <TResponse>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body: any = null,
    options: RequestOptions = { requiresAuth: true }
  ): Promise<ServiceResult<TResponse>> => {

    let token: string | null = null;

    if (options.requiresAuth) {
      token = await SessionService.getJwtTokenAsync();

      if (!token) {
        return { success: false, error: { message: "Usuário não autenticado.", statusCode: 401 } };
      }

      const validToken = await ensureTokenIsValid(token);
      if (!validToken) {
        return { success: false, error: { message: "Sessão expirada.", statusCode: 401 } };
      }
      token = validToken;
    } else {
      token = await SessionService.getJwtTokenAsync();
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      (headers as any)["Authorization"] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      console.log(`[${method}] ${url} (Auth: ${options.requiresAuth}) Time: ${new Date().toISOString()}`);
      let response = await fetch(url, requestInit);

      if (response.status === 401 && options.requiresAuth) {
        // Reativo    
        const refreshSuccess = await SessionService.tryRefreshTokenAsync(false);

        if (refreshSuccess) {
          const newToken = await SessionService.getJwtTokenAsync();

          requestInit.headers = {
            ...headers,
            "Authorization": `Bearer ${newToken}`
          };

          response = await fetch(url, requestInit);
        } else {
          await SessionService.clearSessionAsync();
          return { success: false, error: { message: "Sessão expirada.", statusCode: 401 } };
        }
      }

      if (!response.ok) {
        const error = await createApiErrorAsync(response);
        return { success: false, error: error };
      }

      if (response.status === 204) {
        return { success: true, data: {} as TResponse };
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
      console.error(`Falha na requisição ${method} para ${url}:`, error);
      return {
        success: false,
        error: {
          statusCode: 0,
          message: (error as Error).message || "Falha de rede desconhecida",
        },
      };
    }
  },


  GetAsync: async <TResponse>(endpoint: string, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> => {
    return BaseService._request<TResponse>('GET', endpoint, null, { requiresAuth });
  },

  PostAsync: async <TResponse, TRequest>(endpoint: string, body: TRequest, requiresAuth: boolean = false): Promise<ServiceResult<TResponse>> => {
    return BaseService._request<TResponse>('POST', endpoint, body, { requiresAuth });
  },

  PutAsync: async <TResponse, TRequest>(endpoint: string, body: TRequest, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> => {
    return BaseService._request<TResponse>('PUT', endpoint, body, { requiresAuth });
  },

  DeleteAsync: async <TResponse>(endpoint: string, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> => {
    return BaseService._request<TResponse>('DELETE', endpoint, null, { requiresAuth });
  }
};
