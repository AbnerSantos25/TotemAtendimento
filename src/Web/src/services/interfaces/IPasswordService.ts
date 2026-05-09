import type { ServiceResult } from "../../models/baseServiceModels";
import type { PasswordView, PasswordRequest, PasswordTransferRequest } from "../../models/PasswordModels";

export interface IPasswordService {
    getPasswordByIdAsync(id: string): Promise<ServiceResult<PasswordView>>;
    getPasswordsAsync(queueId: string): Promise<ServiceResult<PasswordView[]>>;
    addPasswordAsync(request: PasswordRequest): Promise<ServiceResult<string>>;
    transferPasswordAsync(passwordId: string, request: PasswordTransferRequest): Promise<ServiceResult<void>>;
    markAsServedAsync(passwordId: string): Promise<ServiceResult<void>>;
    removePasswordAsync(id: string): Promise<ServiceResult<void>>;
}
