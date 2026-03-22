import type { ServiceResult } from "../../models/baseServiceModels";

export interface IBaseService {
    GetAsync<TResponse>(endpoint: string, requiresAuth?: boolean): Promise<ServiceResult<TResponse>>;

    PostAsync<TResponse, TRequest>(endpoint: string, body: TRequest, requiresAuth?: boolean): Promise<ServiceResult<TResponse>>;

    PutAsync<TResponse, TRequest>(endpoint: string, body: TRequest, requiresAuth?: boolean): Promise<ServiceResult<TResponse>>;

    DeleteAsync<TResponse>(endpoint: string, requiresAuth?: boolean): Promise<ServiceResult<TResponse>>;

    PatchAsync<TResponse, TRequest>(endpoint: string, body?: TRequest, requiresAuth?: boolean): Promise<ServiceResult<TResponse>>;
}