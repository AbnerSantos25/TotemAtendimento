import type { ServiceResult } from "../../models/baseServiceModels";
import type { AuthData, LoginRequest } from "../../models/AuthModels";
import { BaseService } from "../BaseService";
import type { IAuthService } from "../interfaces/IAuthService";

class AuthService extends BaseService implements IAuthService {

    public async loginAsync(credentials: LoginRequest): Promise<ServiceResult<AuthData>> {
        return await this.PostAsync<AuthData, LoginRequest>('/totem/identity/login', credentials, false);
    }

    public async logoutAsync(userId: string): Promise<ServiceResult<void>> {
        return await this.PostAsync<void, null>(`/totem/identity/logout/${userId}`, null);
    }

}

export const authService = new AuthService();