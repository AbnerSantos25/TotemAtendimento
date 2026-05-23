import { useCallback, useEffect, useRef, useState } from "react";
import { signalRService } from "@/services/SignalRService";
import type {
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordServedPayload,
  QueuePasswordUpdatedPayload,
} from "@/services/interfaces/ISignalRService";

export interface UseSignalROptions {
  serviceLocationId: string | null;
  queueId: string | null;
  onPasswordCalled?: (data: PasswordCalledPayload) => void;
  onPasswordRecalled?: (data: PasswordCalledPayload) => void;
  onPasswordServed?: (data: PasswordServedPayload) => void;
  onNewPasswordAssigned?: (data: NewPasswordAssignedPayload) => void;
  onQueuePasswordUpdated?: (data: QueuePasswordUpdatedPayload) => void;
}

export interface UseSignalRResult {
  isConnected: boolean;
  connectionError: string | null;
}

export const useSignalR = (options: UseSignalROptions): UseSignalRResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Keep the latest callbacks in a ref to avoid re-running the effect on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(async (serviceLocationId: string, queueId: string | null) => {
    try {
      setConnectionError(null);
      await signalRService.startAsync(serviceLocationId);
      setIsConnected(true);

      if (optionsRef.current.onPasswordCalled) {
        signalRService.onPasswordCalled(optionsRef.current.onPasswordCalled);
      }
      if (optionsRef.current.onPasswordRecalled) {
        signalRService.onPasswordRecalled(optionsRef.current.onPasswordRecalled);
      }
      if (optionsRef.current.onPasswordServed) {
        signalRService.onPasswordServed(optionsRef.current.onPasswordServed);
      }
      if (optionsRef.current.onNewPasswordAssigned) {
        signalRService.onNewPasswordAssigned(optionsRef.current.onNewPasswordAssigned);
      }
      if (optionsRef.current.onQueuePasswordUpdated) {
        signalRService.onQueuePasswordUpdated(optionsRef.current.onQueuePasswordUpdated);
      }

      // Join the queue group so we receive events from all workstations in the same queue
      if (queueId) {
        await signalRService.joinQueueAsync(queueId);
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError((error as Error).message ?? "Unknown connection error");
    }
  }, []);

  useEffect(() => {
    if (!options.serviceLocationId) return;

    connect(options.serviceLocationId, options.queueId);

    return () => {
      if (options.queueId) {
        void signalRService.leaveQueueAsync(options.queueId);
      }
      signalRService.offAll();
      void signalRService.stopAsync();
      setIsConnected(false);
    };
  }, [options.serviceLocationId, options.queueId, connect]);

  return { isConnected, connectionError };
};

