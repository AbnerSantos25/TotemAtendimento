export interface PasswordCalledPayload {
  code: number;
  patientName: string;
}

export interface PasswordServedPayload {
  code: number;
}

export interface NewPasswordAssignedPayload {
  code: number;
  createdAt: string;
}

export interface QueuePasswordUpdatedPayload {
  code: number;
  preferential: boolean;
  serviceLocationId: string;
  serviceLocationName: string;
  served: boolean;
}

export interface ISignalRService {
  startAsync(serviceLocationId: string): Promise<void>;
  stopAsync(): Promise<void>;

  joinQueueAsync(queueId: string): Promise<void>;
  leaveQueueAsync(queueId: string): Promise<void>;

  onPasswordCalled(callback: (data: PasswordCalledPayload) => void): void;
  onPasswordRecalled(callback: (data: PasswordCalledPayload) => void): void;
  onPasswordServed(callback: (data: PasswordServedPayload) => void): void;
  onNewPasswordAssigned(callback: (data: NewPasswordAssignedPayload) => void): void;
  onQueuePasswordUpdated(callback: (data: QueuePasswordUpdatedPayload) => void): void;

  offAll(): void;
  isConnected(): boolean;
}
