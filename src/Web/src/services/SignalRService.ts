import * as signalR from "@microsoft/signalr";
import type {
  ISignalRService,
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordServedPayload,
  QueuePasswordUpdatedPayload,
} from "./interfaces/ISignalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentServiceLocationId: string | null = null;

  async startAsync(serviceLocationId: string): Promise<void> {
    // If already connected to the same room, do nothing
    if (
      this.connection?.state === signalR.HubConnectionState.Connected &&
      this.currentServiceLocationId === serviceLocationId
    ) {
      return;
    }

    // Disconnect from the previous room before joining a new one
    await this.stopAsync();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/passwordHub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      await this.connection.invoke("JoinServiceLocation", serviceLocationId);
      this.currentServiceLocationId = serviceLocationId;
    } catch (error) {
      console.error("[SignalRService] Failed to connect:", error);
      throw error;
    }
  }

  async stopAsync(): Promise<void> {
    if (!this.connection) return;

    try {
      if (
        this.currentServiceLocationId &&
        this.connection.state === signalR.HubConnectionState.Connected
      ) {
        await this.connection.invoke("LeaveServiceLocation", this.currentServiceLocationId);
      }
      await this.connection.stop();
    } catch (error) {
      console.error("[SignalRService] Error while disconnecting:", error);
    } finally {
      this.connection = null;
      this.currentServiceLocationId = null;
    }
  }

  async joinQueueAsync(queueId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("JoinQueue", queueId);
    }
  }

  async leaveQueueAsync(queueId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("LeaveQueue", queueId);
    }
  }

  onPasswordCalled(callback: (data: PasswordCalledPayload) => void): void {
    this.connection?.on("PasswordCalled", callback);
  }

  onPasswordRecalled(callback: (data: PasswordCalledPayload) => void): void {
    this.connection?.on("PasswordRecalled", callback);
  }

  onPasswordServed(callback: (data: PasswordServedPayload) => void): void {
    this.connection?.on("PasswordServed", callback);
  }

  onNewPasswordAssigned(callback: (data: NewPasswordAssignedPayload) => void): void {
    this.connection?.on("NewPasswordAssigned", callback);
  }

  onQueuePasswordUpdated(callback: (data: QueuePasswordUpdatedPayload) => void): void {
    this.connection?.on("QueuePasswordUpdated", callback);
  }

  offAll(): void {
    if (!this.connection) return;
    this.connection.off("PasswordCalled");
    this.connection.off("PasswordRecalled");
    this.connection.off("PasswordServed");
    this.connection.off("NewPasswordAssigned");
    this.connection.off("QueuePasswordUpdated");
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();

