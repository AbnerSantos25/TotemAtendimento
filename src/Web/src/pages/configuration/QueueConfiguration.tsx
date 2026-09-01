import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AGShowMessage } from "@/components/AGShowMessage";
import { queueService } from "@/services/QueueService";
import type { QueueView } from "@/models/QueueModels";
import { GetLocalized } from '@/shared/localization/i18n';
import { Labels, Messages, Errors } from '@/shared/localization/keys';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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

const QueueSchema = z.object({
    name: z.string().min(1, { message: GetLocalized(Errors.QueueNameRequired) }),
    isActive: z.boolean()
});
type QueueFormValues = z.infer<typeof QueueSchema>;

export function QueueConfiguration() {
    const [queues, setQueues] = useState<QueueView[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const form = useForm<QueueFormValues>({
        resolver: zodResolver(QueueSchema),
        defaultValues: {
            name: "",
            isActive: true,
        },
    });

    const [queueToDelete, setQueueToDelete] = useState<{ id: string, name: string } | null>(null);

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

    const handleOpenChange = (open: boolean) => {
        setIsAddDialogOpen(open);
        if (!open) {
            form.reset();
        }
    };

    const onSubmit = async (values: QueueFormValues) => {
        const dto = { name: values.name, isActive: values.isActive };
        const response = await queueService.createQueueAsync(dto);

        if (response.success && response.data) {

            const newQueue: QueueView = {
                id: response.data,
                name: dto.name,
                isActive: dto.isActive,
            }

            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.QueueCreatedSuccess) });
            setQueues(prev => [...prev, newQueue]);
            setIsAddDialogOpen(false);
            form.reset();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.CreationError), description: response.error.message || GetLocalized(Errors.QueueCreationFailed) });
        }
    };

    const handleToggleStatus = async (queue: QueueView, newStatus: boolean) => {
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

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{GetLocalized(Labels.QueueName)}</TableHead>
                                    <TableHead>{GetLocalized(Labels.Status)}</TableHead>
                                    <TableHead className="text-right">{GetLocalized(Labels.Actions)}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={3} rows={5} />
                                ) : filteredQueues.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-0">
                                            <EmptyState
                                                title={GetLocalized(Labels.NoQueueFound)}
                                                description={GetLocalized(Messages.NoQueueFoundDescription)}
                                                icon={<FolderSearch className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                                action={
                                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                                                        <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.CreateQueue)}
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
                                                    {queue.isActive ? GetLocalized(Labels.Active) : GetLocalized(Labels.Inactive)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <div className="flex items-center gap-2 mr-4">
                                                        <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor={`status-${queue.id}`}>
                                                            {queue.isActive ? GetLocalized(Labels.Deactivate) : GetLocalized(Labels.Activate)}
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

            <Dialog open={isAddDialogOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{GetLocalized(Labels.AddNewQueue)}</DialogTitle>
                        <DialogDescription>
                            {GetLocalized(Messages.AddNewQueueDescription)}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.QueueName)}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={GetLocalized(Labels.QueueNamePlaceholder)}
                                                autoFocus
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-2">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel>{GetLocalized(Labels.ActivateImmediately)}</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>{GetLocalized(Labels.Cancel)}</Button>
                                <Button type="submit">{GetLocalized(Labels.SaveQueue)}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

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
