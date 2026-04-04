import type { ServiceResult } from "../../models/baseServiceModels";
import type { UserSummary, RegisterUserRequest, AssignRoleRequest, UpdateUserRolesRequest, ChangePasswordRequest } from "../../models/UserModels";

export interface IUserService {
    getListUserAsync(): Promise<ServiceResult<UserSummary[]>>;
    registerUserAsync(request: RegisterUserRequest): Promise<ServiceResult<void>>;
    inactivateUserAsync(userId: string): Promise<ServiceResult<void>>;
    activateUserAsync(userId: string): Promise<ServiceResult<void>>;
    assignRoleAsync(request: AssignRoleRequest): Promise<ServiceResult<void>>;
    updateUserRolesAsync(request: UpdateUserRolesRequest): Promise<ServiceResult<void>>;
    changePasswordAsync(userId: string, request: ChangePasswordRequest): Promise<ServiceResult<void>>;
}
