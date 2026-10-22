import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { signalRService } from "@/services/SignalRService";
import type {
  NewPasswordAssignedPayload,
  PasswordCalledPayload,
  PasswordCreatedPayload,
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
  onPasswordCreated?: (data: PasswordCreatedPayload) => void;
  onQueuePasswordUpdated?: (data: QueuePasswordUpdatedPayload) => void;
}

export interface UseSignalRResult {
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => Promise<void>;
}

export const useSignalR = (options: UseSignalROptions): UseSignalRResult => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Atualizado após cada render aplicado (e antes dos useEffect); escrever no ref durante o render é inseguro
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  // O SignalR guarda a função recebida: entregamos wrappers fixos que chamam o handler mais recente do ref,
  // então o handler nunca lê estado antigo. offAll antes torna o registro idempotente (sem handlers duplicados).
  const registerHandlers = useCallback(() => {
    signalRService.offAll();
    signalRService.onPasswordCalled((data) => optionsRef.current.onPasswordCalled?.(data));
    signalRService.onPasswordRecalled((data) => optionsRef.current.onPasswordRecalled?.(data));
    signalRService.onPasswordServed((data) => optionsRef.current.onPasswordServed?.(data));
    signalRService.onNewPasswordAssigned((data) => optionsRef.current.onNewPasswordAssigned?.(data));
    signalRService.onPasswordCreated((data) => optionsRef.current.onPasswordCreated?.(data));
    signalRService.onQueuePasswordUpdated((data) => optionsRef.current.onQueuePasswordUpdated?.(data));
  }, []);

  const connect = useCallback(
    async (serviceLocationId: string) => {
      try {
        setConnectionError(null);
        await signalRService.startAsync(serviceLocationId);
        registerHandlers();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
        setConnectionError((error as Error).message ?? "Unknown connection error");
      }
    },
    [registerHandlers]
  );

  // Quedas, reconexões automáticas e fechamento depois de conectado (sem isso a tela seguia "Conectado")
  useEffect(() => signalRService.onConnectionStateChange(setIsConnected), []);

  // A conexão depende só do guichê; trocar de fila não reconecta (ver efeito abaixo)
  useEffect(() => {
    if (!options.serviceLocationId) return;

    connect(options.serviceLocationId);

    return () => {
      signalRService.offAll();
      void signalRService.stopAsync(); // também sai da fila atual
      setIsConnected(false);
    };
  }, [options.serviceLocationId, connect]);

  // Entra na fila ao conectar e ao trocar de fila; joinQueueAsync sai da fila anterior antes
  useEffect(() => {
    if (!isConnected || !options.queueId) return;

    void signalRService.joinQueueAsync(options.queueId);
  }, [isConnected, options.queueId]);

  const reconnect = useCallback(async () => {
    if (optionsRef.current.serviceLocationId) {
      await connect(optionsRef.current.serviceLocationId);
    }
  }, [connect]);

  return { isConnected, connectionError, reconnect };
};
