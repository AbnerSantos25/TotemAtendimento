import type { ServiceResult } from "../../models/baseServiceModels";
import type { LoginRequest, UserView } from "../../models/AuthModels";

export interface IAuthService {
    loginAsync(credentials: LoginRequest): Promise<ServiceResult<UserView>>;
    logoutAsync(userId: string): Promise<ServiceResult<void>>;
    getMeAsync(): Promise<ServiceResult<UserView>>;
}
