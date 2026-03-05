import { jwtDecode } from "jwt-decode";
import type { ApiError, ApiResponse, AuthData, ServiceResult } from "../models/baseServiceModels.js";
import { session } from "./StorageService";
import type { IBaseService } from "./interfaces/IBaseService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RequestOptions = {
    requiresAuth?: boolean;
};

export class BaseService implements IBaseService {

    // --- MÉTODOS PRIVADOS (Lógica interna) ---

    private async createApiErrorAsync(response: Response): Promise<ApiError> {
        let errorBodyText: string = "";
        let friendlyMessage: string = "";
        let validationErrors: Record<string, string[]> | undefined = undefined;

        try {
            errorBodyText = await response.text();
            try {
                const errorJson = JSON.parse(errorBodyText);

                if (errorJson.errors && typeof errorJson.errors === 'object' && !Array.isArray(errorJson.errors)) {
                    validationErrors = errorJson.errors;
                    friendlyMessage = errorJson.title || "Erro.";
                } else if (errorJson.errors && Array.isArray(errorJson.errors)) {
                    friendlyMessage = errorJson.errors.join(', ');
                } else {
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

    async tryRefreshTokenAsync(isRefreshing: boolean): Promise<boolean> {
        try {
            if (!isRefreshing) {
                const user = await session.getUserAsync();
                const tokenId = await session.getJwtTokenAsync();

                if (!user || !tokenId) return false;

                const response = await this.GetAsync<AuthData>(`/totem/RefreshToken/user/${user.id}/token/${tokenId}`, false);

                if (!response.success || !response.data) {
                    console.error("Falha no refresh Token");
                    return false;
                }

                await session.saveAuthDataAsync(response.data);
                return true;
            }

            console.error("Cai no Loop Prevention, do Refresh Token");
            return false;

        } catch (error) {
            console.error("Catch Exception:", error);
            return false;
        }
    }

    private async GetjwtDecodedAsync(currentToken: string): Promise<any | null> {
        return jwtDecode(currentToken);
    }

    private async ensureTokenIsValid(currentToken: string): Promise<string | null> {
        try {
            const decoded: any = await this.GetjwtDecodedAsync(currentToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime + 120) {
                const success = await this.tryRefreshTokenAsync(false);
                if (success) {
                    return await session.getJwtTokenAsync();
                } else {
                    console.error("Falha ao renovar token proativamente.");
                    await session.clearSessionAsync();
                    return null;
                }
            }
            return currentToken;
        } catch (e) {
            console.error("Exception no ensureTokenIsValid", e);
            return null;
        }
    }

    private async _request<TResponse>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        body: any = null,
        options: RequestOptions = { requiresAuth: true }
    ): Promise<ServiceResult<TResponse>> {
        let token: string | null = null;

        if (options.requiresAuth) {
            token = await session.getJwtTokenAsync();

            if (!token) {
                return { success: false, error: { message: "Usuário não autenticado.", statusCode: 401 } };
            }

            const validToken = await this.ensureTokenIsValid(token);
            if (!validToken) {
                return { success: false, error: { message: "Sessão expirada.", statusCode: 401 } };
            }
            token = validToken;
        } else {
            token = await session.getJwtTokenAsync();
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
            let response = await fetch(url, requestInit);

            if (response.status === 401 && options.requiresAuth) {
                const refreshSuccess = await this.tryRefreshTokenAsync(false);

                if (refreshSuccess) {
                    const newToken = await session.getJwtTokenAsync();
                    requestInit.headers = {
                        ...headers,
                        "Authorization": `Bearer ${newToken}`
                    };
                    response = await fetch(url, requestInit);
                } else {
                    await session.clearSessionAsync();
                    return { success: false, error: { message: "Sessão expirada.", statusCode: 401 } };
                }
            }

            if (!response.ok) {
                const error = await this.createApiErrorAsync(response);
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
            return {
                success: false,
                error: {
                    statusCode: 0,
                    message: (error as Error).message || "Falha de rede desconhecida",
                },
            };
        }
    }

    // --- MÉTODOS PÚBLICOS (Implementação da Interface) ---

    public async GetAsync<TResponse>(endpoint: string, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> {
        return this._request<TResponse>('GET', endpoint, null, { requiresAuth });
    }

    public async PostAsync<TResponse, TRequest>(endpoint: string, body: TRequest, requiresAuth: boolean = false): Promise<ServiceResult<TResponse>> {
        return this._request<TResponse>('POST', endpoint, body, { requiresAuth });
    }

    public async PutAsync<TResponse, TRequest>(endpoint: string, body: TRequest, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> {
        return this._request<TResponse>('PUT', endpoint, body, { requiresAuth });
    }

    public async DeleteAsync<TResponse>(endpoint: string, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> {
        return this._request<TResponse>('DELETE', endpoint, null, { requiresAuth });
    }
}

// Exportamos uma instância única (Singleton) para ser usada em toda a aplicação Web
export const api = new BaseService();