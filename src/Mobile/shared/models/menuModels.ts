export interface MenuQueue {
  name: string;
  queueId: string;
  preferential: boolean;
}

export interface QueueRequest {
  queueId: string;
  preferential: boolean;
}