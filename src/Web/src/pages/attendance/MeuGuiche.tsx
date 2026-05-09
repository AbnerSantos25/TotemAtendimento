import { useCallback, useEffect, useState } from "react";
import { Megaphone, Play, RefreshCcw, CheckCircle2, WifiOff, Monitor, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSignalR } from "@/hooks/useSignalR";
import { serviceLocationService } from "@/services/ServiceLocationService";
import { passwordService } from "@/services/PasswordService";
import { queueService } from "@/services/QueueService";
import type { PasswordView } from "@/models/PasswordModels";
import type { ServiceLocationView } from "@/models/ServiceLocationModels";
import type { QueueView } from "@/models/QueueModels";
import type {
  PasswordCalledPayload,
  PasswordServedPayload,
  NewPasswordAssignedPayload
} from "@/services/interfaces/ISignalRService";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_GUICHE = "selected_guiche_id";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MeuGuiche() {
  // --- Selection State ---
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string | null>(localStorage.getItem(STORAGE_KEY_GUICHE));
  const [workstation, setWorkstation] = useState<ServiceLocationView | null>(null);
  const [availableWorkstations, setAvailableWorkstations] = useState<ServiceLocationView[]>([]);
  const [availableQueues, setAvailableQueues] = useState<QueueView[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string | "">("");

  // --- Data State ---
  const [passwords, setPasswords] = useState<PasswordView[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Derived state ---
  const currentPassword = passwords.find((p) => !p.served && p.serviceLocation?.id === selectedWorkstationId);
  const waitingPasswords = passwords.filter((p) => !p.served && !p.serviceLocation);
  const servedPasswords = passwords.filter((p) => p.served && p.serviceLocation?.id === selectedWorkstationId);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queueResult = await queueService.getAllQueuesAsync();
      let currentQueueId = selectedQueueId;

      if (queueResult.success) {
        const activeQueues = queueResult.data.filter(q => q.isActive);
        setAvailableQueues(activeQueues);
        if (activeQueues.length > 0 && !currentQueueId) {
          currentQueueId = activeQueues[0].id;
          setSelectedQueueId(currentQueueId);
        }
      }

      const promises: Promise<any>[] = [
        serviceLocationService.getListAsync()
      ];

      if (currentQueueId) {
        promises.push(passwordService.getPasswordsAsync(currentQueueId));
      }

      const results = await Promise.all(promises);
      const workResult = results[0];
      const passResult = currentQueueId ? results[1] : null;

      if (passResult && passResult.success) {
        setPasswords(passResult.data);
      } else if (!currentQueueId) {
        setPasswords([]);
      }

      if (workResult.success) {
        setAvailableWorkstations(workResult.data);
        if (selectedWorkstationId) {
          const found = workResult.data.find((w: any) => w.id === selectedWorkstationId);
          if (found) setWorkstation(found);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkstationId, selectedQueueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // SignalR event handlers
  // ---------------------------------------------------------------------------

  const handlePasswordCalled = useCallback((_data: PasswordCalledPayload) => {
    // Refresh full list to ensure consistency
    fetchData();
  }, [fetchData]);

  const handlePasswordServed = useCallback((_data: PasswordServedPayload) => {
    fetchData();
  }, [fetchData]);

  const handleNewPasswordAssigned = useCallback((_data: NewPasswordAssignedPayload) => {
    fetchData();
  }, [fetchData]);

  const { isConnected } = useSignalR({
    serviceLocationId: selectedWorkstationId,
    onPasswordCalled: handlePasswordCalled,
    onPasswordServed: handlePasswordServed,
    onNewPasswordAssigned: handleNewPasswordAssigned,
  });

  // ---------------------------------------------------------------------------
  // HTTP actions
  // ---------------------------------------------------------------------------

  const handleCallNext = async () => {
    if (!selectedWorkstationId || !selectedQueueId || !workstation) return;

    setActionLoading(true);
    try {
      const result = await serviceLocationService.notifyAvailableAsync(selectedWorkstationId, {
        queueId: selectedQueueId,
        name: workstation.name
      });

      if (result.success) {
        // SignalR will update the state for us, but we can also refresh manually
        await fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!selectedWorkstationId) return;

    setActionLoading(true);
    try {
      await serviceLocationService.recallCurrentPasswordAsync(selectedWorkstationId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishAtendance = async () => {
    if (!currentPassword) return;

    setActionLoading(true);
    try {
      const result = await passwordService.markAsServedAsync(currentPassword.passwordId);
      if (result.success) {
        await fetchData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectWorkstation = (id: string) => {
    setSelectedWorkstationId(id);
    localStorage.setItem(STORAGE_KEY_GUICHE, id);
    const found = availableWorkstations.find(w => w.id === id);
    if (found) setWorkstation(found);
  };

  const handleLogoutWorkstation = () => {
    setSelectedWorkstationId(null);
    setWorkstation(null);
    localStorage.removeItem(STORAGE_KEY_GUICHE);
  };

  // ---------------------------------------------------------------------------
  // Selection View
  // ---------------------------------------------------------------------------

  if (!selectedWorkstationId || !workstation) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <Monitor className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Identificação do Guichê</CardTitle>
            <CardDescription>Selecione onde você irá realizar os atendimentos hoje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Guichê Disponível</label>
              <Select onValueChange={handleSelectWorkstation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um guichê..." />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkstations.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} {w.number ? `(${w.number})` : ""}
                    </SelectItem>
                  ))}
                  {availableWorkstations.length === 0 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">Nenhum guichê encontrado</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={!selectedWorkstationId}
              onClick={() => fetchData()}
            >
              Iniciar Sessão
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Dashboard View
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-12xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Atendimento</h1>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={handleLogoutWorkstation}>
              Trocar Guichê
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">{workstation.name} {workstation.number ? `- Sala ${workstation.number}` : ""}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Queue Selector */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm font-medium text-muted-foreground">Fila:</span>
            <Select value={selectedQueueId} onValueChange={setSelectedQueueId}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Selecione a fila" />
              </SelectTrigger>
              <SelectContent>
                {availableQueues.map(q => (
                  <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge
            variant="outline"
            className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${isConnected
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {isConnected ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                </>
              ) : (
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              )}
            </span>
            {isConnected ? "SignalR Ativo" : "Desconectado"}
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="overflow-hidden shadow-sm p-0">
            <CardHeader className="bg-slate-900 dark:bg-slate-950 py-4 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Megaphone className="h-5 w-5" />
                  Em Atendimento
                </CardTitle>
                <Badge className="bg-slate-800 text-slate-200 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800">
                  {workstation.name}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-16">
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground/20" />
              ) : currentPassword ? (
                <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                  <Badge className={`mb-6 px-4 py-1 text-sm border-none ${currentPassword.preferential
                    ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                    }`}>
                    {currentPassword.preferential ? "Preferencial" : "Convencional"}
                  </Badge>
                  <span className="text-8xl font-black tracking-tighter text-foreground sm:text-[9rem]">
                    {currentPassword.code}
                  </span>
                  <span className="mt-4 text-2xl font-medium text-muted-foreground">
                    Senha em Atendimento
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <WifiOff className="mb-4 h-16 w-16 opacity-20" />
                  <span className="text-xl font-medium">Nenhum atendimento em andamento</span>
                  <span className="text-sm">Clique abaixo para chamar a próxima senha da fila</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-muted/50 p-4 border-t flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 text-base h-12"
                onClick={handleRecall}
                disabled={!currentPassword || actionLoading}
              >
                <RefreshCcw className={`mr-2 h-5 w-5 ${actionLoading ? 'animate-spin' : ''}`} />
                Rechamar
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 text-base h-12 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                onClick={handleFinishAtendance}
                disabled={!currentPassword || actionLoading}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Finalizar
              </Button>
            </CardFooter>
          </Card>

          <Button
            size="lg"
            className="w-full py-10 text-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] bg-blue-600 hover:bg-blue-700"
            onClick={handleCallNext}
            disabled={waitingPasswords.length === 0 || !!currentPassword || actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="mr-3 h-8 w-8 animate-spin" />
            ) : (
              <Play className="mr-3 h-8 w-8 fill-current" />
            )}
            Chamar Próxima Senha
          </Button>

          {waitingPasswords.length === 0 && !currentPassword && !loading && (
            <p className="text-center text-sm text-muted-foreground">A fila está vazia no momento.</p>
          )}

          {currentPassword && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400 font-medium">
              Finalize o atendimento atual antes de chamar a próxima senha.
            </p>
          )}
        </div>

        {/* Side Column */}
        <div className="flex flex-row gap-6 lg:col-span-2">
          {/* Queue: Waiting */}
          <Card className="flex-1 flex flex-col shadow-sm overflow-hidden h-[600px]" style={{ padding: 0, gap: 0 }}>
            <CardHeader className="bg-muted/50 pt-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Fila de Espera</CardTitle>
                <Badge variant="secondary">{waitingPasswords.length}</Badge>
              </div>
            </CardHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="flex flex-col divide-y">
                  {waitingPasswords.length > 0 ? (
                    waitingPasswords.map((password, index) => (
                      <div
                        key={password.passwordId}
                        className={`flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${index === 0 ? "bg-blue-500/5 dark:bg-blue-500/10" : ""
                          }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xl ${index === 0 ? "text-blue-700 dark:text-blue-400" : "text-foreground"
                                }`}
                            >
                              {password.code}
                            </span>
                            {password.preferential && (
                              <Badge className="bg-amber-500 hover:bg-amber-500 text-[9px] uppercase px-1.5 py-0 text-white">
                                Pref.
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Chegada: {new Date(password.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {index === 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600/20 bg-blue-600/5">Próxima</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {loading ? "Carregando fila..." : "Ninguém aguardando"}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>

          {/* Queue: Served */}
          <Card className="flex-1 flex flex-col shadow-sm overflow-hidden h-[600px]" style={{ padding: 0, gap: 0 }}>
            <CardHeader className="bg-muted/50 pt-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Meus Atendimentos</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
                >
                  {servedPasswords.length}
                </Badge>
              </div>
            </CardHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="flex flex-col divide-y">
                  {servedPasswords.length > 0 ? (
                    servedPasswords.map((password) => (
                      <div
                        key={password.passwordId}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {password.code}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Finalizado às: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {loading ? "Carregando..." : "Nenhum atendimento finalizado"}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
