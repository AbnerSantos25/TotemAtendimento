import { api } from "./BaseService";
import type { ServiceResult } from "../models/baseServiceModels";
import type { UserSummary, RegisterUserRequest, AssignRoleRequest, UpdateUserRolesRequest, ChangePasswordRequest } from "../models/UserModels";

export class UserService {
    private readonly basePath = "/totem/Identity";

    // #region Queries
    public async getListUserAsync(): Promise<ServiceResult<UserSummary[]>> {
        return api.GetAsync<UserSummary[]>(`${this.basePath}/users`);
    }
    // #endregion

    // #region Cadastro
    public async registerUserAsync(request: RegisterUserRequest): Promise<ServiceResult<void>> {
        return api.PostAsync<void, RegisterUserRequest>(`${this.basePath}/register`, request);
    }
    // #endregion

    // #region Status (Ativar / Inativar)
    public async inactivateUserAsync(id: string): Promise<ServiceResult<void>> {
        return api.PatchAsync<void, void>(`${this.basePath}/user/${id}/inactivate`, undefined);
    }

    public async activateUserAsync(id: string): Promise<ServiceResult<void>> {
        return api.PatchAsync<void, void>(`${this.basePath}/user/${id}/active`, undefined);
    }
    // #endregion

    // #region Perfis (Roles)
    public async assignRoleAsync(request: AssignRoleRequest): Promise<ServiceResult<void>> {
        return api.PostAsync<void, AssignRoleRequest>(`${this.basePath}/assign-role`, request, true);
    }

    public async updateUserRolesAsync(request: UpdateUserRolesRequest): Promise<ServiceResult<void>> {
        return api.PostAsync<void, UpdateUserRolesRequest>(`${this.basePath}/assign-roles`, request, true);
    }
    // #endregion

    public async changePasswordAsync(userId: string, request: ChangePasswordRequest): Promise<ServiceResult<void>> {
        return api.PostAsync<void, ChangePasswordRequest>(`${this.basePath}/user/${userId}/change-password`, request, true);
    }
}

export const userService = new UserService();
