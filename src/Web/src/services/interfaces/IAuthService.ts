import type { ServiceResult } from "../../models/baseServiceModels";
import type { AuthData, LoginRequest } from "../../models/AuthModels";

export interface IAuthService {
    loginAsync(credentials: LoginRequest): Promise<ServiceResult<AuthData>>;
    logoutAsync(userId: string): Promise<ServiceResult<void>>;
}
