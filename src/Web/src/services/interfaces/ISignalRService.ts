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

export interface ISignalRService {
  startAsync(serviceLocationId: string): Promise<void>;
  stopAsync(): Promise<void>;

  onPasswordCalled(callback: (data: PasswordCalledPayload) => void): void;
  onPasswordRecalled(callback: (data: PasswordCalledPayload) => void): void;
  onPasswordServed(callback: (data: PasswordServedPayload) => void): void;
  onNewPasswordAssigned(callback: (data: NewPasswordAssignedPayload) => void): void;

  offAll(): void;
  isConnected(): boolean;
}
