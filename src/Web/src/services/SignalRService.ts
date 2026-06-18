import * as signalR from "@microsoft/signalr";
import type {
  ISignalRService,
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordCreatedPayload,
  PasswordServedPayload,
} from "./interfaces/ISignalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentServiceLocationId: string | null = null;
  private currentQueueId: string | null = null;

  async startAsync(serviceLocationId: string): Promise<void> {
    if (
      this.connection?.state === signalR.HubConnectionState.Connected &&
      this.currentServiceLocationId === serviceLocationId
    ) {
      return;
    }

    await this.stopAsync();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/passwordHub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.onreconnected(async () => {
      await this.rejoinGroupsAsync();
    });

    try {
      await this.connection.start();
      await this.connection.invoke("JoinServiceLocation", serviceLocationId);
      this.currentServiceLocationId = serviceLocationId;
    } catch (error) {
      console.error("[SignalRService] Failed to connect:", error);
      throw error;
    }
  }

  async joinQueueAsync(queueId: string): Promise<void> {
    if (this.currentQueueId === queueId) return;

    if (
      this.currentQueueId &&
      this.connection?.state === signalR.HubConnectionState.Connected
    ) {
      await this.connection.invoke("LeaveQueue", this.currentQueueId);
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("JoinQueue", queueId);
      this.currentQueueId = queueId;
    }
  }

  async leaveQueueAsync(queueId: string): Promise<void> {
    if (
      this.currentQueueId !== queueId ||
      this.connection?.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    await this.connection.invoke("LeaveQueue", queueId);
    this.currentQueueId = null;
  }

  async stopAsync(): Promise<void> {
    if (!this.connection) return;

    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        if (this.currentQueueId) {
          await this.connection.invoke("LeaveQueue", this.currentQueueId);
        }
        if (this.currentServiceLocationId) {
          await this.connection.invoke(
            "LeaveServiceLocation",
            this.currentServiceLocationId
          );
        }
      }
      await this.connection.stop();
    } catch (error) {
      console.error("[SignalRService] Error while disconnecting:", error);
    } finally {
      this.connection = null;
      this.currentServiceLocationId = null;
      this.currentQueueId = null;
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

  onPasswordCreated(callback: (data: PasswordCreatedPayload) => void): void {
    this.connection?.on("PasswordCreated", callback);
  }

  offAll(): void {
    if (!this.connection) return;
    this.connection.off("PasswordCalled");
    this.connection.off("PasswordRecalled");
    this.connection.off("PasswordServed");
    this.connection.off("NewPasswordAssigned");
    this.connection.off("PasswordCreated");
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  private async rejoinGroupsAsync(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.currentServiceLocationId) {
      await this.connection.invoke("JoinServiceLocation", this.currentServiceLocationId);
    }
    if (this.currentQueueId) {
      await this.connection.invoke("JoinQueue", this.currentQueueId);
    }
  }
}

export const signalRService = new SignalRService();
