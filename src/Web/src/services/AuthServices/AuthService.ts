import type { ServiceResult } from "../../models/baseServiceModels";
import type { AuthData, LoginRequest } from "../../models/AuthModels";
import { api } from "../BaseService";

export interface IAuthService {
    loginAsync(credentials: LoginRequest): Promise<ServiceResult<AuthData>>;
    logoutAsync(userId: string): Promise<ServiceResult<void>>;
}

class AuthServiceImpl implements IAuthService {

    async loginAsync(credentials: LoginRequest): Promise<ServiceResult<AuthData>> {
        return await api.PostAsync<AuthData, LoginRequest>('/totem/identity/login', credentials, false);
    }

    async logoutAsync(userId: string): Promise<ServiceResult<void>> {
        return await api.PostAsync<void, null>(`/totem/identity/logout/${userId}`, null);
    }

}
export const authService = new AuthServiceImpl();