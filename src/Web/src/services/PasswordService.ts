import { BaseService } from "./BaseService";
import type { ServiceResult } from "../models/baseServiceModels";
import type { PasswordView, PasswordRequest, PasswordTransferRequest } from "../models/PasswordModels";
import type { IPasswordService } from "./interfaces/IPasswordService";

export class PasswordService extends BaseService implements IPasswordService {
    private readonly basePath = "/totem/Password";

    public async getPasswordByIdAsync(id: string): Promise<ServiceResult<PasswordView>> {
        return this.GetAsync<PasswordView>(`${this.basePath}/${id}`);
    }

    public async getPasswordsAsync(queueId: string): Promise<ServiceResult<PasswordView[]>> {
        return this.GetAsync<PasswordView[]>(`${this.basePath}?queueId=${queueId}`);
    }

    public async addPasswordAsync(request: PasswordRequest): Promise<ServiceResult<string>> {
        return this.PostAsync<string, PasswordRequest>(this.basePath, request);
    }

    public async transferPasswordAsync(passwordId: string, request: PasswordTransferRequest): Promise<ServiceResult<void>> {
        return this.PostAsync<void, PasswordTransferRequest>(`${this.basePath}/${passwordId}/transfer`, request);
    }

    public async markAsServedAsync(passwordId: string): Promise<ServiceResult<void>> {
        return this.PatchAsync<void, null>(`${this.basePath}/${passwordId}/MarkAsServed`);
    }

    public async removePasswordAsync(id: string): Promise<ServiceResult<void>> {
        return this.DeleteAsync<void>(`${this.basePath}/${id}`);
    }
}

export const passwordService = new PasswordService();
