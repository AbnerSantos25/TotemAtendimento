import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceTypeService } from "@/services/ServiceTypeService";
import { queueService } from "@/services/QueueService";
import type { ServiceTypeSummary, ServiceTypeRequest } from "@/models/ServiceTypeModels";
import type { QueueView } from "@/models/QueueModels";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Trash2, X, Settings2, LayoutGrid, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { FolderSearch } from "lucide-react";

export const ServiceTypeConfiguration = () => {
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeSummary[]>([]);
    const [queues, setQueues] = useState<QueueView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ServiceTypeRequest>({
        title: "",
        icon: "",
        color: "#3b82f6",
        ticketPrefix: "",
        targetQueueId: ""
    });

    const [serviceToDelete, setServiceToDelete] = useState<{ id: string, title: string } | null>(null);

    const renderIcon = (icon: string | null | undefined, className: string = "") => {
        if (!icon) return <LayoutGrid className={className || "h-4 w-4 text-muted-foreground"} />;

        const safeIcon = icon.replace(/[^a-zA-Z0-9\s\-]/g, '');
        return <i className={`${safeIcon} ${className}`} />;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicesRes, queuesRes] = await Promise.all([
                serviceTypeService.getAllAsync(),
                queueService.getAllQueuesAsync()
            ]);

            if (servicesRes.success) {
                setServiceTypes(servicesRes.data);
            } else {
                AGShowMessage.error({ title: "Erro", description: servicesRes.error.message });
            }

            if (queuesRes.success) {
                setQueues(queuesRes.data);
            } else {
                AGShowMessage.error({ title: "Erro", description: queuesRes.error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredServices = serviceTypes.filter(s => {
        const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? s.isActive : !s.isActive);
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.ticketPrefix?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        return matchesStatus && matchesSearch;
    });

    const handleOpenCreateDialog = () => {
        setEditingId(null);
        setFormData({
            title: "",
            icon: "",
            color: "#3b82f6",
            ticketPrefix: "",
            targetQueueId: queues.find(q => q.isActive)?.id || ""
        });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = async (id: string) => {
        setLoading(true);
        const response = await serviceTypeService.getByIdAsync(id);
        setLoading(false);

        if (response.success) {
            setEditingId(id);
            setFormData({
                title: response.data.title,
                icon: response.data.icon || "",
                color: response.data.color || "#3b82f6",
                ticketPrefix: response.data.ticketPrefix || "",
                targetQueueId: response.data.targetQueueId
            });
            setIsDialogOpen(true);
        } else {
            AGShowMessage.error({ title: "Erro ao buscar detalhes", description: response.error.message });
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            AGShowMessage.warning({ title: "Atenção", description: "O título é obrigatório." });
            return;
        }
        if (!formData.targetQueueId) {
            AGShowMessage.warning({ title: "Atenção", description: "Selecione uma fila de destino." });
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
                title: "Sucesso",
                description: `Tipo de serviço ${editingId ? 'atualizado' : 'criado'} com sucesso.`
            });
            setIsDialogOpen(false);
            fetchData(); // Refresh list
        } else {
            AGShowMessage.error({
                title: "Erro ao salvar",
                description: response.error.message
            });
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const response = await serviceTypeService.toggleStatusAsync(id);
        if (response.success) {
            AGShowMessage.success({
                title: "Status Atualizado",
                description: `O serviço foi ${!currentStatus ? 'ativado' : 'desativado'}.`
            });
            setServiceTypes(prev => prev.map(s => s.serviceTypeId === id ? { ...s, isActive: !currentStatus } : s));
        } else {
            AGShowMessage.error({ title: "Erro", description: response.error.message });
        }
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        const response = await serviceTypeService.deleteAsync(serviceToDelete.id);
        if (response.success) {
            AGShowMessage.success({ title: "Excluído", description: "O tipo de serviço foi removido com sucesso." });
            setServiceTypes(prev => prev.filter(s => s.serviceTypeId !== serviceToDelete.id));
        } else {
            AGShowMessage.error({ title: "Erro", description: response.error.message });
        }
        setServiceToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tipos de Serviço</h2>
                    <p className="text-muted-foreground">Configure os botões e categorias de atendimento do Totem.</p>
                </div>
                <Button onClick={handleOpenCreateDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Serviços Cadastrados</CardTitle>
                    <CardDescription>Defina as filas e aparências para cada tipo de senha.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:max-w-md">
                            <Input
                                placeholder="Buscar serviço por título ou prefixo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-70 hover:opacity-100 focus:outline-none focus:bg-accent"
                                    title="Limpar busca"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="inactive">Inativos</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex-1 flex justify-end">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchData}
                                disabled={loading}
                                title="Recarregar Grid"
                                className="h-10 w-10"
                            >
                                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Serviço</TableHead>
                                    <TableHead>Cor</TableHead>
                                    <TableHead>Prefixo</TableHead>
                                    <TableHead>Fila Destino</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={6} rows={5} />
                                ) : filteredServices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="p-0">
                                            <EmptyState
                                                title="Nenhum serviço encontrado"
                                                description="Nenhum resultado corresponde aos filtros atuais."
                                                icon={<FolderSearch className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredServices.map((service) => (
                                        <TableRow key={service.serviceTypeId}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded-lg flex items-center justify-center min-w-[40px]">
                                                        {renderIcon(service.icon, "text-xl")}
                                                    </div>
                                                    {service.title}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className="w-6 h-6 rounded-full border shadow-sm"
                                                    style={{ backgroundColor: service.color }}
                                                    title={service.color}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {service.ticketPrefix && (
                                                    <Badge variant="outline" className="font-mono">{service.ticketPrefix}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {queues.find(q => q.id === service.targetQueueId)?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={service.isActive ? "default" : "secondary"}>
                                                    {service.isActive ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <div className="flex items-center gap-2 mr-4">
                                                        <Switch
                                                            id={`status-${service.serviceTypeId}`}
                                                            checked={service.isActive}
                                                            onCheckedChange={() => handleToggleStatus(service.serviceTypeId, service.isActive)}
                                                        />
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEditDialog(service.serviceTypeId)}
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setServiceToDelete({ id: service.serviceTypeId, title: service.title })}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Serviço' : 'Criar Novo Serviço'}</DialogTitle>
                        <DialogDescription>
                            Configure a aparência e o comportamento do botão no Totem.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 items-start">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título do Serviço</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Ex: Consultas Médicas"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="icon">Ícone Bootstrap (Classe)</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon ?? ""}
                                    onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                                    placeholder="Ex: bi bi-card-list"
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                    Acesse <a href="https://icons.getbootstrap.com/" target="_blank" rel="noreferrer" className="underline hover:text-primary">icons.getbootstrap.com</a> para ver todos.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="color">Cor de Destaque</Label>
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
                                <Label htmlFor="prefix">Prefixo da Senha</Label>
                                <Input
                                    id="prefix"
                                    value={formData.ticketPrefix ?? ""}
                                    onChange={(e) => setFormData(p => ({ ...p, ticketPrefix: e.target.value }))}
                                    placeholder="Ex: CONS"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="queue">Fila de Destino</Label>
                                <Select
                                    value={formData.targetQueueId}
                                    onValueChange={(val) => setFormData(p => ({ ...p, targetQueueId: val }))}
                                >
                                    <SelectTrigger id="queue">
                                        <SelectValue placeholder="Selecione uma fila" />
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
                                        {renderIcon(formData.icon, "text-3xl")}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="leading-tight break-all text-xs">{formData.title || 'Novo Serviço'}</span>
                                        <span className="text-xs opacity-75">{formData.ticketPrefix ? `${formData.ticketPrefix}001` : '001'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!serviceToDelete}
                onOpenChange={(open) => !open && setServiceToDelete(null)}
                title="Excluir Serviço"
                description={`Tem certeza que deseja excluir o serviço "${serviceToDelete?.title}"?`}
                onConfirm={handleDelete}
                confirmText="Confirmar Exclusão"
            />
        </div>
    );
};
