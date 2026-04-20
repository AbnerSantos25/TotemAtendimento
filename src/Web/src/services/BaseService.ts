import Cookies from 'js-cookie';
import type { ApiError, ApiResponse, ServiceResult } from "../models/baseServiceModels.js";
import { session } from "./StorageService";
import type { IBaseService } from "./interfaces/IBaseService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RequestOptions = {
    requiresAuth?: boolean;
};

export class BaseService implements IBaseService {

    //#region Métodos Privados (Lógica interna)

    private async createApiErrorAsync(response: Response): Promise<ApiError> {
        let errorBodyText: string = "";
        let friendlyMessage: string = "";
        let validationErrors: Record<string, string[]> | undefined = undefined;

        try {
            errorBodyText = await response.text();

            if (response.status >= 500) {
                return {
                    statusCode: response.status,
                    message: "Ocorreu um erro inesperado no servidor. Nossa equipe técnica já foi notificada.",
                    body: errorBodyText,
                    validationErrors: undefined
                };
            }

            try {
                const errorJson = JSON.parse(errorBodyText);

                if (errorJson.errors && typeof errorJson.errors === 'object' && !Array.isArray(errorJson.errors)) {
                    validationErrors = errorJson.errors;
                    friendlyMessage = errorJson.title || "Erro de validação.";
                } else if (errorJson.errors && Array.isArray(errorJson.errors)) {
                    friendlyMessage = errorJson.errors.join(', ');
                } else if (errorJson.title) {
                    friendlyMessage = errorJson.title;
                } else if (errorJson.detail) {
                    friendlyMessage = errorJson.detail;
                } else {
                    friendlyMessage = errorBodyText.length > 200 ? "Ocorreu um erro ao processar a requisição." : errorBodyText;
                }
            } catch (jsonError) {
                friendlyMessage = errorBodyText.length > 200 ? "Falha na comunicação com o servidor." : errorBodyText;
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

    private async tryRefreshTokenAsync(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/totem/RefreshToken/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
            });


            if (!response.ok) {
                console.warn("[BaseService] Falha no refresh Token. Status:", response.status);
                return false;
            }

            return true;
        } catch (error) {
            console.error("[BaseService] Excecao no refresh:", error);
            return false;
        }
    }

    private async _request<TResponse>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        body: any = null,
        options: RequestOptions = { requiresAuth: true }
    ): Promise<ServiceResult<TResponse>> {

        const url = `${API_BASE_URL}${endpoint}`;
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Anti-CSRF: Adiciona o token XSRF no header se o cookie existir e não for método GET
        const xsrfToken = Cookies.get('XSRF-TOKEN');
        if (xsrfToken && method !== 'GET') {
            (headers as any)["X-XSRF-TOKEN"] = xsrfToken;
        }

        const requestInit: RequestInit = {
            method,
            headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined,
        };


        try {
            let response = await fetch(url, requestInit);


            if (response.status === 401 && options.requiresAuth) {
                const refreshSuccess = await this.tryRefreshTokenAsync();

                if (refreshSuccess) {
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

    //#endregion

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

    public async PatchAsync<TResponse, TRequest>(endpoint: string, body?: TRequest, requiresAuth: boolean = true): Promise<ServiceResult<TResponse>> {
        return this._request<TResponse>('PATCH', endpoint, body ?? null, { requiresAuth });
    }
}

export const api = new BaseService();