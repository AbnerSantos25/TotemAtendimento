import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { AGShowMessage } from "@/components/AGShowMessage";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import type { AttendanceDisplayView } from "@/models/PasswordModels";
import type { PanelPasswordCalledPayload } from "@/services/interfaces/ISignalRService";
import { passwordService } from "@/services/PasswordService";
import { queueService } from "@/services/QueueService";
import { signalRService } from "@/services/SignalRService";
import { Activity, Loader2, LogOut, Monitor, Settings, ShieldPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function AttendanceDisplay() {
    const [passwords, setPasswords] = useState<AttendanceDisplayView[]>([]);
    const [loading, setLoading] = useState(true);
    const [openSettings, setOpenSettings] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const { signOut } = useAuth();

    const fetchLatestCalls = useCallback(async () => {
        try {
            const result = await passwordService.getLatestCallsAsync();
            if (result.success) {
                setPasswords(result.data);
            } else {
                AGShowMessage.error({
                    title: GetLocalized(Labels.Error),
                    description: GetLocalized(Messages.FailedToLoadPasswords),
                });
            }
        } catch (error) {
            console.error("Failed to fetch latest calls", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        fetchLatestCalls();

        const setupSignalR = async () => {
            try {
                await signalRService.startAsync("panel-global-temp");

                const queueResult = await queueService.getAllQueuesAsync();
                if (queueResult.success) {
                    const activeQueueIds = queueResult.data.filter(q => q.isActive).map(q => q.id);
                    await signalRService.joinQueuesAsync(activeQueueIds);
                } else {
                    console.error("[SignalR - Panel] Failed to fetch queues to join:", queueResult);
                }

                signalRService.onPanelPasswordCalled((data: PanelPasswordCalledPayload) => {
                    if (!mounted) {
                        return;
                    }

                    setPasswords((prev) => {
                        const newPassword: AttendanceDisplayView = {
                            passwordCode: data.code?.toString() || "",
                            serviceLocationName: data.serviceLocationName || "",
                            queueName: GetLocalized(Labels.Queue) + " " + (data.queueId ? data.queueId.substring(0, 4) : ""),
                            index: 1
                        };

                        newPassword.passwordCode = `${data.preferential ? 'P' : 'N'}${(data.code || 0).toString().padStart(3, '0')}`;

                        const updatedList = [newPassword, ...prev].slice(0, 6).map((p, idx) => ({
                            ...p,
                            index: idx + 1
                        }));

                        return updatedList;
                    });
                });
            } catch (e) {
                console.error("SignalR start failed in AttendanceDisplay", e);
            }
        };

        setupSignalR();

        const interval = setInterval(() => {
            setIsConnected(signalRService.isConnected());
        }, 1000);

        return () => {
            mounted = false;
            clearInterval(interval);
            signalRService.offAll();
            signalRService.stopAsync();
        };
    }, [fetchLatestCalls]);

    const handleLogout = async () => {
        await signOut();
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#051A2C] text-white">
                <Loader2 className="h-12 w-12 animate-spin text-[#6FC5FF]" />
            </div>
        );
    }

    const currentCall = passwords.length > 0 ? passwords[0] : null;
    const previousCalls = passwords.length > 1 ? passwords.slice(1) : [];

    return (
        <div className="h-screen w-screen bg-[#051A2C] text-white flex overflow-hidden relative font-sans">

            {/* Hover Menu Top Right */}
            <div className="absolute top-0 right-0 p-4 opacity-0 hover:opacity-100 transition-opacity duration-300 flex gap-2 z-50 items-center">
                <div className={`px-3 py-1.5 rounded-md border text-sm font-medium flex items-center gap-2 ${isConnected
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : "border-red-500/30 bg-red-500/10 text-red-400"
                    }`}>
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
                    {isConnected ? GetLocalized(Labels.SignalRActive) : GetLocalized(Labels.Disconnected)}
                </div>
                <Button variant="secondary" onClick={() => setOpenSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    {GetLocalized(Labels.Queues)}
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {GetLocalized(Labels.Logout)}
                </Button>
            </div>

            {/* Left Column - History */}
            <div className="w-[480px] bg-white border-r border-[#E6E6E6] flex flex-col z-10">
                {/* Header da Coluna (Logo) */}
                <div className="py-8 flex flex-col items-center justify-center">
                    <ShieldPlus className="h-14 w-14 text-[#003A6D] mb-2" strokeWidth={1.5} />
                    <h2 className="text-xl font-bold text-[#003A6D] text-center leading-tight">
                        CLÍNICA<br />SÃO BENTO
                    </h2>
                </div>

                {/* Título "Últimas Senhas" com linhas decorativas */}
                <div className="flex items-center justify-center mb-4 px-8">
                    <div className="h-px bg-[#E6E6E6] flex-1"></div>
                    <h3 className="mx-4 text-[#003A6D] font-bold text-lg tracking-wide uppercase">{GetLocalized(Labels.LatestPasswords)}</h3>
                    <div className="h-px bg-[#E6E6E6] flex-1"></div>
                </div>

                {/* Lista de Senhas Anteriores */}
                <div className="flex-1 overflow-hidden flex flex-col px-8 pb-8 gap-4">
                    {previousCalls.map((call, idx) => (
                        <div key={idx} className="flex flex-col border-b border-[#E6E6E6] pb-3">
                            <div className="flex justify-between mb-1">
                                <span className="bg-[#003A6D] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {GetLocalized(Labels.LatestPasswords)}
                                </span>
                                <span className="bg-[#003A6D] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {GetLocalized(Labels.Desk)}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline px-2">
                                <span className="text-4xl font-bold text-[#003A6D]">
                                    {call.passwordCode}
                                </span>
                                <span className="text-4xl font-bold text-[#0A6DB5]">
                                    {call.serviceLocationName.replace(/\D/g, '') || "1"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Fill empty spaces mantendo o layout */}
                    {Array.from({ length: Math.max(0, 5 - previousCalls.length) }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="flex flex-col border-b border-[#E6E6E6] pb-3 opacity-30">
                            <div className="flex justify-between mb-1">
                                <span className="bg-[#003A6D] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {GetLocalized(Labels.LatestPasswords)}
                                </span>
                                <span className="bg-[#003A6D] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {GetLocalized(Labels.Desk)}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline px-2">
                                <span className="text-4xl font-bold text-[#003A6D]">----</span>
                                <span className="text-4xl font-bold text-[#0A6DB5]">-</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Column */}
            <div className="flex-1 flex flex-col bg-[#051A2C]">

                {/* Header - Senha Atual */}
                <div className="h-[200px] bg-[#003A6D] flex">
                    {/* Área Código */}
                    <div className="flex-1 flex flex-col items-center justify-center border-r border-[#0A6DB5]/50">
                        <div className="bg-white text-[#003A6D] font-bold text-xl py-1 px-8 rounded-full mb-2 uppercase tracking-widest">
                            {currentCall ? currentCall.queueName : GetLocalized(Labels.Waiting)}
                        </div>
                        <div className="text-[120px] font-bold leading-none tracking-tighter text-[#6FC5FF]">
                            {currentCall ? currentCall.passwordCode : "----"}
                        </div>
                    </div>

                    {/* Área Guichê */}
                    <div className="w-1/3 flex flex-col items-center justify-center bg-[#003A6D]">
                        <div className="bg-white text-[#003A6D] font-bold text-xl py-1 px-8 rounded-full mb-2 uppercase tracking-widest">
                            {GetLocalized(Labels.Desk)}
                        </div>
                        <div className="text-[120px] font-bold leading-none text-[#6FC5FF]">
                            {currentCall ? (currentCall.serviceLocationName.replace(/\D/g, '') || "1") : "-"}
                        </div>
                    </div>
                </div>

                {/* Content - Informações do Exame */}
                <div className="flex-1 flex items-center justify-center px-16">
                    {currentCall ? (
                        <div className="flex w-full h-full items-center justify-between gap-12">
                            <div className="flex-1 max-w-2xl">
                                <h1 className="text-[64px] font-bold text-[#6FC5FF] mb-6 uppercase leading-[1.1]">
                                    {currentCall.queueName}:
                                </h1>
                                <p className="text-[32px] text-white leading-snug">
                                    {GetLocalized(Messages.PleaseProceedTo)} {currentCall.serviceLocationName.toLowerCase()} {GetLocalized(Messages.ToBeServed)}
                                </p>
                            </div>
                            <div className="w-[400px] flex justify-center items-center">
                                {/* Substituir por <img src="..." /> com a imagem dinâmica se tiver no back-end */}
                                <Activity className="h-64 w-64 text-[#E6E6E6] opacity-90" strokeWidth={1} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-50">
                            <Monitor className="h-32 w-32 mx-auto mb-6 text-[#6FC5FF]" />
                            <p className="text-4xl font-bold text-[#6FC5FF]">{GetLocalized(Messages.WaitingForCalls)}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="h-[100px] bg-white flex items-center justify-center z-10">
                    <span className="text-xl font-bold text-[#003A6D] tracking-wide">clinicasaobento.com.br</span>
                </div>
            </div>

            {/* Settings Dialog */}
            <Dialog open={openSettings} onOpenChange={setOpenSettings}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{GetLocalized(Labels.FilterQueues)}</DialogTitle>
                        <DialogDescription>
                            {GetLocalized(Messages.SelectQueuesToDisplay)}
                            {GetLocalized(Messages.SaveFeatureNotImplemented)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <p className="text-sm text-gray-500 text-center">
                            {GetLocalized(Messages.CheckboxListWillAppearHere)}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}