export interface QueueView {
    id: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
}

export interface QueueRequest {
    name: string;
    isActive: boolean;
}
