import { useState } from "react";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceTypeService } from "@/services/ServiceTypeService";
import type { ServiceTypeRequest } from "@/models/ServiceTypeModels";
import type { QueueView } from "@/models/QueueModels";
import { DEFAULT_SERVICE_TYPE_ICON, resolveServiceTypeIcon } from "@/lib/serviceTypeIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceTypeIcon } from "@/components/serviceType/ServiceTypeIcon";

const AVAILABLE_ICONS = [
    { name: "LayoutGrid", label: "Padrão" },
    { name: "User", label: "Usuário / Cadastro" },
    { name: "Activity", label: "Saúde / Triagem" },
    { name: "Calendar", label: "Agenda / Calendário" },
    { name: "CreditCard", label: "Financeiro / Pagamentos" },
    { name: "Briefcase", label: "Geral / Serviços" },
    { name: "FileText", label: "Documentos" },
    { name: "TriangleAlert", label: "Urgência / Emergência" },
    { name: "HeartPulse", label: "Atendimento Médico" },
    { name: "HelpCircle", label: "Informações / Dúvidas" },
    { name: "Smartphone", label: "Digital / Aplicativo" },
    { name: "Ticket", label: "Ingressos / Senhas" },
];

// id null = criação; data = valores iniciais do formulário
export interface ServiceTypeFormTarget {
    id: string | null;
    data: ServiceTypeRequest;
}

interface ServiceTypeFormDialogProps {
    target: ServiceTypeFormTarget | null;
    queues: QueueView[];
    onClose: () => void;
    onSaved: () => void;
}

export function ServiceTypeFormDialog({ target, queues, onClose, onSaved }: ServiceTypeFormDialogProps) {
    const [formData, setFormData] = useState<ServiceTypeRequest>({
        title: "",
        icon: "",
        color: "#3b82f6",
        ticketPrefix: "",
        targetQueueId: ""
    });

    // Recarrega o formulário sempre que o diálogo é aberto para outro item
    const [loadedTarget, setLoadedTarget] = useState<ServiceTypeFormTarget | null>(null);
    if (target && target !== loadedTarget) {
        setLoadedTarget(target);
        setFormData(target.data);
    }

    const editingId = loadedTarget?.id ?? null;

    const handleSave = async () => {
        if (!formData.title.trim()) {
            AGShowMessage.warning({ title: GetLocalized(Messages.Warning), description: GetLocalized(Messages.TitleIsRequired) });
            return;
        }
        if (!formData.targetQueueId) {
            AGShowMessage.warning({ title: GetLocalized(Messages.Warning), description: GetLocalized(Messages.SelectTargetQueue) });
            return;
        }

        const requestData: ServiceTypeRequest = {
            ...formData,
            ticketPrefix: formData.ticketPrefix?.trim() || null,
            icon: formData.icon?.trim() || null
        };

        const response = editingId
            ? await serviceTypeService.updateAsync(editingId, requestData)
            : await serviceTypeService.createAsync(requestData);

        if (response.success) {
            AGShowMessage.success({
                title: GetLocalized(Labels.Success),
                description: editingId ? GetLocalized(Messages.ServiceTypeUpdated) : GetLocalized(Messages.ServiceTypeCreated)
            });
            onClose();
            onSaved();
        } else {
            AGShowMessage.error({
                title: GetLocalized(Errors.ErrorSaving),
                description: response.error.message
            });
        }
    };

    return (
        <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingId ? GetLocalized(Labels.EditService) : GetLocalized(Labels.CreateNewService)}</DialogTitle>
                    <DialogDescription>
                        {GetLocalized(Labels.ServiceDialogDescription)}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 items-start">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{GetLocalized(Labels.ServiceTitle)}</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                placeholder={GetLocalized(Labels.ExMedicalConsultations)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="icon">{GetLocalized(Labels.BootstrapIconClass)}</Label>
                            <Select
                                value={formData.icon ?? "LayoutGrid"}
                                onValueChange={(val) => setFormData(p => ({ ...p, icon: val }))}
                            >
                                <SelectTrigger id="icon" className="w-full">
                                    <SelectValue placeholder="Selecione um ícone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ICONS.map((item) => {
                                        const IconComponent = resolveServiceTypeIcon(item.name) ?? DEFAULT_SERVICE_TYPE_ICON;
                                        return (
                                            <SelectItem key={item.name} value={item.name}>
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="color">{GetLocalized(Labels.HighlightColor)}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    className="w-12 p-1"
                                    value={formData.color ?? "#000000"}
                                    onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                />
                                <Input
                                    value={formData.color ?? ""}
                                    onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                    className="flex-1 font-mono uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 max-w-full">
                        <div className="grid gap-2">
                            <Label htmlFor="prefix">{GetLocalized(Labels.TicketPrefix)}</Label>
                            <Input
                                id="prefix"
                                value={formData.ticketPrefix ?? ""}
                                onChange={(e) => setFormData(p => ({ ...p, ticketPrefix: e.target.value }))}
                                placeholder={GetLocalized(Labels.ExCons)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="queue">{GetLocalized(Labels.TargetQueue)}</Label>
                            <Select
                                value={formData.targetQueueId}
                                onValueChange={(val) => setFormData(p => ({ ...p, targetQueueId: val }))}
                            >
                                <SelectTrigger id="queue">
                                    <SelectValue placeholder={GetLocalized(Labels.SelectQueue)} />
                                </SelectTrigger>
                                <SelectContent>
                                    {queues.filter(q => q.isActive).map(q => (
                                        <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-xl mt-2 bg-muted/30 overflow-hidden w-full">
                            <div
                                className="px-6 py-4 rounded-xl shadow-lg border text-white font-bold flex items-center gap-3 transition-transform hover:scale-105 cursor-default max-w-full"
                                style={{ backgroundColor: formData.color || '#3b82f6' }}
                            >
                                <span className="text-2xl flex items-center justify-center min-w-[32px]">
                                    <ServiceTypeIcon icon={formData.icon} className="text-3xl" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="leading-tight break-all text-xs">{formData.title || GetLocalized(Labels.NewService)}</span>
                                    <span className="text-xs opacity-75">{formData.ticketPrefix ? `${formData.ticketPrefix}001` : '001'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{GetLocalized(Labels.Cancel)}</Button>
                    <Button onClick={handleSave}>{GetLocalized(Labels.SaveChanges)}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
