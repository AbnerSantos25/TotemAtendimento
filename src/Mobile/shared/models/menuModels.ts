export interface MenuQueue {
  title : string;
  icon : string;
  color?: string;
  ticketPrefix: string;
  queueId: string;
  preferential: boolean;
}

export interface QueueRequest {
  queueId: string;
  preferential: boolean;
}