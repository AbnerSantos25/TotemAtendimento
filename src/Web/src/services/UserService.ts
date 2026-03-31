import { api } from "./BaseService";
import type { ServiceResult } from "../models/baseServiceModels";
import type { UserSummary, RegisterUserRequest, ChangePasswordRequest } from "../models/UserModels";

export class UserService {
    private readonly basePath = "/totem/Identity";

    public async getListUserAsync(): Promise<ServiceResult<UserSummary[]>> {
        return api.GetAsync<UserSummary[]>(`${this.basePath}/users`);
    }

    public async registerUserAsync(request: RegisterUserRequest): Promise<ServiceResult<void>> {
        return api.PostAsync<void, RegisterUserRequest>(`${this.basePath}/register`, request);
    }

    public async changePasswordAsync(userId: string, request: ChangePasswordRequest): Promise<ServiceResult<void>> {
        return api.PostAsync<void, ChangePasswordRequest>(`${this.basePath}/user/${userId}/change-password`, request, true);
    }
}

export const userService = new UserService();
