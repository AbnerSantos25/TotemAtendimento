import type { ServiceResult } from "../../models/baseServiceModels";
import type { LoginRequest, UserView } from "../../models/AuthModels";
import { BaseService } from "../BaseService";
import type { IAuthService } from "../interfaces/IAuthService";

class AuthService extends BaseService implements IAuthService {

    public async loginAsync(credentials: LoginRequest): Promise<ServiceResult<UserView>> {
        return await this.PostAsync<UserView, LoginRequest>('/totem/identity/login', credentials, false);
    }

    public async logoutAsync(userId: string): Promise<ServiceResult<void>> {
        return await this.PostAsync<void, null>(`/totem/identity/logout/${userId}`, null);
    }

    public async getMeAsync(): Promise<ServiceResult<UserView>> {
        return await this.GetAsync<UserView>('/totem/identity/me');
    }

}

export const authService = new AuthService();