import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { queueService } from "@/services/QueueService";
import type { QueueView } from "@/models/QueueModels";
import { GetLocalized } from '@/shared/localization/i18n';
import { Labels, Messages, Errors } from '@/shared/localization/keys';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { QueueTable } from "@/components/queue/QueueTable";
import { AddQueueDialog } from "@/components/queue/AddQueueDialog";

export function QueueConfiguration() {
    const [queues, setQueues] = useState<QueueView[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [queueToDelete, setQueueToDelete] = useState<QueueView | null>(null);

    const fetchQueues = async () => {
        setLoading(true);

        const response = await queueService.getAllQueuesAsync();

        if (response.success && response.data) {
            setQueues(response.data);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.SearchError), description: response.error.message || GetLocalized(Errors.LoadQueuesFailed) });
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

    const handleToggleStatus = async (queue: QueueView) => {
        const newStatus = !queue.isActive;
        const response = await queueService.toggleQueueStatusAsync(queue.id);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.StatusUpdated), description: newStatus ? GetLocalized(Messages.QueueStatusUpdatedActive, { name: queue.name }) : GetLocalized(Messages.QueueStatusUpdatedInactive, { name: queue.name }) });
            setQueues(prev => prev.map(q => q.id === queue.id ? { ...q, isActive: newStatus } : q));
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.UpdateError), description: response.error.message || GetLocalized(Errors.StatusUpdateFailed) });
        }
    };

    const handleDeleteQueue = async () => {
        if (!queueToDelete) return;

        const response = await queueService.deleteQueueAsync(queueToDelete.id);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Removed), description: GetLocalized(Messages.QueueRemovedSuccess) });
            setQueues(prev => prev.filter(q => q.id !== queueToDelete.id));
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.DeletionError), description: response.error.message || GetLocalized(Errors.QueueDeletionFailed) });
        }
        setQueueToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{GetLocalized(Labels.QueueManagementTitle)}</h2>
                    <p className="text-muted-foreground">{GetLocalized(Messages.QueueManagementDescription)}</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.NewQueue)}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{GetLocalized(Labels.RegisteredQueues)}</CardTitle>
                    <CardDescription>{GetLocalized(Messages.RegisteredQueuesDescription)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:max-w-md">
                            <Input
                                placeholder={GetLocalized(Labels.SearchQueueByName)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-8"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-70 hover:opacity-100 focus:outline-none focus:bg-accent"
                                    title={GetLocalized(Labels.ClearSearch)}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={GetLocalized(Labels.QueueStatus)} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{GetLocalized(Labels.All)}</SelectItem>
                                <SelectItem value="active">{GetLocalized(Labels.OnlyActive)}</SelectItem>
                                <SelectItem value="inactive">{GetLocalized(Labels.OnlyInactive)}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <QueueTable
                        queues={filteredQueues}
                        loading={loading}
                        onAdd={() => setIsAddDialogOpen(true)}
                        onToggleStatus={handleToggleStatus}
                        onDelete={setQueueToDelete}
                    />
                </CardContent>
            </Card>

            <AddQueueDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onCreated={(queue) => setQueues(prev => [...prev, queue])}
            />

            <ConfirmDialog
                open={!!queueToDelete}
                onOpenChange={(open) => !open && setQueueToDelete(null)}
                title={GetLocalized(Labels.ConfirmDeletion)}
                description={queueToDelete ? GetLocalized(Messages.ConfirmQueueDeletion, { name: queueToDelete.name }) : ""}
                onConfirm={handleDeleteQueue}
                confirmText={GetLocalized(Labels.ConfirmDeletion)}
            />
        </div>
    );
}
