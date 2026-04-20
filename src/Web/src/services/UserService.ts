import { BaseService } from "./BaseService";
import type { ServiceResult } from "../models/baseServiceModels";
import type { 
    UserSummary, 
    RegisterUserRequest, 
    AssignRoleRequest, 
    UpdateUserRolesRequest, 
    ChangePasswordRequest 
} from "../models/UserModels";
import type { IUserService } from "./interfaces/IUserService";

export class UserService extends BaseService implements IUserService {
    private readonly basePath = "/totem/Identity";

    public async getListUserAsync(): Promise<ServiceResult<UserSummary[]>> {
        return this.GetAsync<UserSummary[]>(`${this.basePath}/users`);
    }

    public async registerUserAsync(request: RegisterUserRequest): Promise<ServiceResult<void>> {
        return this.PostAsync<void, RegisterUserRequest>(`${this.basePath}/register`, request);
    }

    public async inactivateUserAsync(userId: string): Promise<ServiceResult<void>> {
        return this.PatchAsync<void, void>(`${this.basePath}/user/${userId}/inactivate`, undefined);
    }

    public async activateUserAsync(userId: string): Promise<ServiceResult<void>> {
        return this.PatchAsync<void, void>(`${this.basePath}/user/${userId}/active`, undefined);
    }

    public async assignRoleAsync(request: AssignRoleRequest): Promise<ServiceResult<void>> {
        return this.PostAsync<void, AssignRoleRequest>(`${this.basePath}/assign-role`, request, true);
    }

    public async updateUserRolesAsync(request: UpdateUserRolesRequest): Promise<ServiceResult<void>> {
        return this.PostAsync<void, UpdateUserRolesRequest>(`${this.basePath}/assign-roles`, request, true);
    }

    public async changePasswordAsync(userId: string, request: ChangePasswordRequest): Promise<ServiceResult<void>> {
        return this.PostAsync<void, ChangePasswordRequest>(`${this.basePath}/user/${userId}/change-password`, request, true);
    }
}

export const userService = new UserService();
