import type { ServiceResult } from "../models/baseServiceModels";
import type { QueueView, QueueRequest } from "../models/QueueModels";
import { BaseService } from "./BaseService";
import type { IQueueService } from "./interfaces/IQueueService";

export class QueueService extends BaseService implements IQueueService {
    private readonly basePath = "/totem/Queue";

    public async getAllQueuesAsync(): Promise<ServiceResult<QueueView[]>> {
        return this.GetAsync<QueueView[]>(this.basePath);
    }

    public async getQueueByIdAsync(id: string): Promise<ServiceResult<QueueView>> {
        return this.GetAsync<QueueView>(`${this.basePath}/${id}`);
    }

    public async createQueueAsync(dto: QueueRequest): Promise<ServiceResult<QueueView>> {
        return this.PostAsync<QueueView, QueueRequest>(this.basePath, dto);
    }

    public async updateQueueAsync(id: string, dto: QueueRequest): Promise<ServiceResult<QueueView>> {
        return this.PutAsync<QueueView, QueueRequest>(`${this.basePath}/${id}`, dto);
    }

    public async deleteQueueAsync(id: string): Promise<ServiceResult<void>> {
        return this.DeleteAsync<void>(`${this.basePath}/${id}`);
    }

    public async toggleQueueStatusAsync(id: string): Promise<ServiceResult<QueueView>> {
        return this.PatchAsync<QueueView, null>(`${this.basePath}/${id}/toggleQueueStatus`);
    }
}

export const queueService = new QueueService();
