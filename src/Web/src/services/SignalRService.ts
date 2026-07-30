import * as signalR from "@microsoft/signalr";
import type {
  ISignalRService,
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordCreatedPayload,
  PasswordServedPayload,
  QueuePasswordUpdatedPayload,
  PanelPasswordCalledPayload,
} from "./interfaces/ISignalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentServiceLocationId: string | null = null;
  private currentQueueId: string | null = null;
  private currentQueueIds: string[] = [];

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

  async joinQueuesAsync(queueIds: string[]): Promise<void> {
    const toJoin = queueIds.filter(id => !this.currentQueueIds.includes(id));
    const toLeave = this.currentQueueIds.filter(id => !queueIds.includes(id));

    this.currentQueueIds = [...queueIds];

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      for (const id of toLeave) {
        await this.connection.invoke("LeaveQueue", id);
      }
      for (const id of toJoin) {
        await this.connection.invoke("JoinQueue", id);
      }
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
        for (const id of this.currentQueueIds) {
          await this.connection.invoke("LeaveQueue", id);
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
      this.currentQueueIds = [];
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

  onQueuePasswordUpdated(callback: (data: QueuePasswordUpdatedPayload) => void): void {
    this.connection?.on("QueuePasswordUpdated", callback);
  }

  onPanelPasswordCalled(callback: (data: PanelPasswordCalledPayload) => void): void {
    this.connection?.on("PasswordCalled", callback);
  }

  offAll(): void {
    if (!this.connection) return;
    this.connection.off("PasswordCalled");
    this.connection.off("PasswordRecalled");
    this.connection.off("PasswordServed");
    this.connection.off("NewPasswordAssigned");
    this.connection.off("PasswordCreated");
    this.connection.off("QueuePasswordUpdated");
    this.connection.off("PasswordCalled");
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
    for (const id of this.currentQueueIds) {
      await this.connection.invoke("JoinQueue", id);
    }
  }
}

export const signalRService = new SignalRService();

