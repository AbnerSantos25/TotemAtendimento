import { useCallback, useEffect, useRef, useState } from "react";
import { signalRService } from "@/services/SignalRService";
import type {
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordCreatedPayload,
  PasswordServedPayload,
} from "@/services/interfaces/ISignalRService";

export interface UseSignalROptions {
  serviceLocationId: string | null;
  queueId: string | null;
  onPasswordCalled?: (data: PasswordCalledPayload) => void;
  onPasswordRecalled?: (data: PasswordCalledPayload) => void;
  onPasswordServed?: (data: PasswordServedPayload) => void;
  onNewPasswordAssigned?: (data: NewPasswordAssignedPayload) => void;
  onPasswordCreated?: (data: PasswordCreatedPayload) => void;
}

export interface UseSignalRResult {
  isConnected: boolean;
  connectionError: string | null;
}

export const useSignalR = (options: UseSignalROptions): UseSignalRResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const registerHandlers = useCallback(() => {
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
    if (optionsRef.current.onPasswordCreated) {
      signalRService.onPasswordCreated(optionsRef.current.onPasswordCreated);
    }
  }, []);

  const connect = useCallback(
    async (serviceLocationId: string, queueId: string | null) => {
      try {
        setConnectionError(null);
        await signalRService.startAsync(serviceLocationId);
        registerHandlers();

        if (queueId) {
          await signalRService.joinQueueAsync(queueId);
        }

        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
        setConnectionError((error as Error).message ?? "Unknown connection error");
      }
    },
    [registerHandlers]
  );

  useEffect(() => {
    if (!options.serviceLocationId) return;

    connect(options.serviceLocationId, options.queueId);

    return () => {
      signalRService.offAll();
      void signalRService.stopAsync();
      setIsConnected(false);
    };
  }, [options.serviceLocationId, connect]);

  useEffect(() => {
    if (!isConnected || !options.queueId) return;

    void signalRService.joinQueueAsync(options.queueId);
  }, [isConnected, options.queueId]);

  return { isConnected, connectionError };
};
