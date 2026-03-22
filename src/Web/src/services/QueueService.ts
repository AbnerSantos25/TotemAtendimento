import { api } from "./BaseService";
import type { ServiceResult } from "../models/baseServiceModels";
import type { QueueView, QueueRequest } from "../models/QueueModels";

export class QueueService {
    private readonly basePath = "/totem/Queue";

    public async getAllQueuesAsync(): Promise<ServiceResult<QueueView[]>> {
        return api.GetAsync<QueueView[]>(this.basePath);
    }

    public async getQueueByIdAsync(id: string): Promise<ServiceResult<QueueView>> {
        return api.GetAsync<QueueView>(`${this.basePath}/${id}`);
    }

    public async createQueueAsync(dto: QueueRequest): Promise<ServiceResult<QueueView>> {
        return api.PostAsync<QueueView, QueueRequest>(this.basePath, dto);
    }

    public async updateQueueAsync(id: string, dto: QueueRequest): Promise<ServiceResult<QueueView>> {
        return api.PutAsync<QueueView, QueueRequest>(`${this.basePath}/${id}`, dto);
    }

    public async deleteQueueAsync(id: string): Promise<ServiceResult<void>> {
        return api.DeleteAsync<void>(`${this.basePath}/${id}`);
    }

    public async toggleQueueStatusAsync(id: string): Promise<ServiceResult<QueueView>> {
        return api.PatchAsync<QueueView, null>(`${this.basePath}/${id}/toggleQueueStatus`);
    }
}

export const queueService = new QueueService();
