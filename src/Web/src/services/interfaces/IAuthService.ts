import type { ServiceResult } from "../../models/baseServiceModels";
import type { AuthResult, LoginRequest, UserView } from "../../models/AuthModels";

export interface IAuthService {
    loginAsync(credentials: LoginRequest): Promise<ServiceResult<AuthResult>>;
    logoutAsync(userId: string): Promise<ServiceResult<void>>;
    getMeAsync(): Promise<ServiceResult<UserView>>;
}
