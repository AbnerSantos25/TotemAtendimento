import { useCallback, useEffect, useRef, useState } from "react";
import { signalRService } from "@/services/SignalRService";
import type {
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordServedPayload,
} from "@/services/interfaces/ISignalRService";

export interface UseSignalROptions {
  serviceLocationId: string | null;
  onPasswordCalled?: (data: PasswordCalledPayload) => void;
  onPasswordRecalled?: (data: PasswordCalledPayload) => void;
  onPasswordServed?: (data: PasswordServedPayload) => void;
  onNewPasswordAssigned?: (data: NewPasswordAssignedPayload) => void;
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

  const connect = useCallback(async (serviceLocationId: string) => {
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
    } catch (error) {
      setIsConnected(false);
      setConnectionError((error as Error).message ?? "Unknown connection error");
    }
  }, []);

  useEffect(() => {
    if (!options.serviceLocationId) return;

    connect(options.serviceLocationId);

    return () => {
      signalRService.offAll();
      void signalRService.stopAsync();
      setIsConnected(false);
    };
  }, [options.serviceLocationId, connect]);

  return { isConnected, connectionError };
};
