import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { queueService } from "@/services/QueueService";
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
import { Plus, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { FolderSearch } from "lucide-react";

export function QueueConfiguration() {
    const [queues, setQueues] = useState<QueueView[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newQueueName, setNewQueueName] = useState("");
    const [newQueueActive, setNewQueueActive] = useState(true);

    const [queueToDelete, setQueueToDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchQueues = async () => {
        setLoading(true);

        // Simulando delay de rede de 2 segundos para ver os Skeletons (REMOVA DEPOIS!)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Em um cenário real, você buscaria da API. Aqui vamos usar dados fixos ou chamadas de fallback até a API estar pronta.
        const response = await queueService.getAllQueuesAsync();

        if (response.success && response.data) {
            setQueues(response.data);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro na Busca", description: response.error.message || "Falha ao carregar filas." });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQueues();
    }, []);

    const filteredQueues = queues.filter(q => {
        if (filterStatus === "active" && !q.isActive) return false;
        if (filterStatus === "inactive" && q.isActive) return false;
        if (searchTerm && !q.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const handleAddQueue = async () => {
        if (!newQueueName.trim()) {
            AGShowMessage.warning({ title: "Atenção", description: "O nome da fila é obrigatório." });
            return;
        }

        const dto = { name: newQueueName, isActive: newQueueActive };
        const response = await queueService.createQueueAsync(dto);

        if (response.success && response.data) {
            AGShowMessage.success({ title: "Sucesso", description: "Fila criada com sucesso." });
            setQueues(prev => [...prev, response.data]);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro na Criação", description: response.error.message || "Não foi possível criar a fila." });
        }
        setIsAddDialogOpen(false);
        setNewQueueName("");
        setNewQueueActive(true);
    };

    const handleToggleStatus = async (queue: QueueView, newStatus: boolean) => {
        const response = await queueService.toggleQueueStatusAsync(queue.id);

        if (response.success) {
            AGShowMessage.success({ title: "Status Atualizado", description: `A fila ${queue.name} foi ${newStatus ? 'ativada' : 'desativada'}.` });
            setQueues(prev => prev.map(q => q.id === queue.id ? { ...q, isActive: newStatus } : q));
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro na Atualização", description: response.error.message || "Não foi possível alterar o status." });
        }
    };

    const handleDeleteQueue = async () => {
        if (!queueToDelete) return;

        const response = await queueService.deleteQueueAsync(queueToDelete.id);

        if (response.success) {
            AGShowMessage.success({ title: "Removida", description: "A fila foi removida com sucesso." });
            setQueues(prev => prev.filter(q => q.id !== queueToDelete.id));
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro na Exclusão", description: response.error.message || "Não foi possível remover a fila." });
        }
        setQueueToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Filas</h2>
                    <p className="text-muted-foreground">Adicione, remova e desative filas de atendimento.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Nova Fila
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filas Cadastradas</CardTitle>
                    <CardDescription>Gerencie as filas existentes e seus status operacionais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:max-w-md">
                            <Input
                                placeholder="Buscar fila por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-8"
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
                                <SelectValue placeholder="Status da Fila" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="active">Apenas Ativas</SelectItem>
                                <SelectItem value="inactive">Apenas Inativas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome da Fila</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={3} rows={5} />
                                ) : filteredQueues.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-0">
                                            <EmptyState
                                                title="Nenhuma fila encontrada"
                                                description="Nenhum resultado corresponde aos filtros atuais ou o sistema ainda não possui filas cadastradas."
                                                icon={<FolderSearch className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                                action={
                                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                                                        <Plus className="mr-2 h-4 w-4" /> Criar Fila
                                                    </Button>
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredQueues.map((queue) => (
                                        <TableRow key={queue.id}>
                                            <TableCell className="font-medium">{queue.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={queue.isActive ? "default" : "secondary"}>
                                                    {queue.isActive ? "Ativa" : "Inativa"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <div className="flex items-center gap-2 mr-4">
                                                        <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor={`status-${queue.id}`}>
                                                            {queue.isActive ? "Desativar" : "Ativar"}
                                                        </Label>
                                                        <Switch
                                                            id={`status-${queue.id}`}
                                                            checked={queue.isActive}
                                                            onCheckedChange={(checked) => handleToggleStatus(queue, checked)}
                                                        />
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setQueueToDelete({ id: queue.id, name: queue.name })}
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Nova Fila</DialogTitle>
                        <DialogDescription>
                            Configure os detalhes para a nova fila de atendimento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Fila</Label>
                            <Input
                                id="name"
                                value={newQueueName}
                                onChange={(e) => setNewQueueName(e.target.value)}
                                placeholder="Ex: Prioritário"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Switch
                                id="active"
                                checked={newQueueActive}
                                onCheckedChange={setNewQueueActive}
                            />
                            <Label htmlFor="active">Ativar Imediatamente</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddQueue}>Salvar Fila</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!queueToDelete}
                onOpenChange={(open) => !open && setQueueToDelete(null)}
                title="Confirmar Exclusão"
                description={`Tem certeza que deseja remover a fila "${queueToDelete?.name}"? Esta ação não pode ser desfeita.`}
                onConfirm={handleDeleteQueue}
                confirmText="Confirmar Exclusão"
            />
        </div>
    );
}
