import type { ServiceResult } from "../../models/baseServiceModels";
import type { QueueView, QueueRequest } from "../../models/QueueModels";

export interface IQueueService {
    getAllQueuesAsync(): Promise<ServiceResult<QueueView[]>>;
    getQueueByIdAsync(id: string): Promise<ServiceResult<QueueView>>;
    createQueueAsync(dto: QueueRequest): Promise<ServiceResult<QueueView>>;
    updateQueueAsync(id: string, dto: QueueRequest): Promise<ServiceResult<QueueView>>;
    deleteQueueAsync(id: string): Promise<ServiceResult<void>>;
    toggleQueueStatusAsync(id: string): Promise<ServiceResult<QueueView>>;
}
