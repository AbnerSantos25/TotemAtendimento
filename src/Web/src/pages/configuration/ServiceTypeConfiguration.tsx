import { useState, useEffect } from "react";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceTypeService } from "@/services/ServiceTypeService";
import { queueService } from "@/services/QueueService";
import type { ServiceTypeSummary } from "@/models/ServiceTypeModels";
import type { QueueView } from "@/models/QueueModels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, RefreshCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ServiceTypeTable } from "@/components/serviceType/ServiceTypeTable";
import { ServiceTypeFormDialog, type ServiceTypeFormTarget } from "@/components/serviceType/ServiceTypeFormDialog";

export const ServiceTypeConfiguration = () => {
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeSummary[]>([]);
    const [queues, setQueues] = useState<QueueView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

    const [formTarget, setFormTarget] = useState<ServiceTypeFormTarget | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<ServiceTypeSummary | null>(null);

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
                AGShowMessage.error({ title: GetLocalized(Labels.Error), description: servicesRes.error.message });
            }

            if (queuesRes.success) {
                setQueues(queuesRes.data);
            } else {
                AGShowMessage.error({ title: GetLocalized(Labels.Error), description: queuesRes.error.message });
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
        setFormTarget({
            id: null,
            data: {
                title: "",
                icon: "",
                color: "#3b82f6",
                ticketPrefix: "",
                targetQueueId: queues.find(q => q.isActive)?.id || ""
            }
        });
    };

    const handleOpenEditDialog = async (service: ServiceTypeSummary) => {
        setLoading(true);
        const response = await serviceTypeService.getByIdAsync(service.serviceTypeId);
        setLoading(false);

        if (response.success) {
            setFormTarget({
                id: service.serviceTypeId,
                data: {
                    title: response.data.title,
                    icon: response.data.icon || "",
                    color: response.data.color || "#3b82f6",
                    ticketPrefix: response.data.ticketPrefix || "",
                    targetQueueId: response.data.targetQueueId
                }
            });
        } else {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorFetchingDetails), description: response.error.message });
        }
    };

    const handleToggleStatus = async (service: ServiceTypeSummary) => {
        const { serviceTypeId: id, isActive: currentStatus } = service;
        const response = await serviceTypeService.toggleStatusAsync(id);
        if (response.success) {
            AGShowMessage.success({
                title: GetLocalized(Labels.StatusUpdated),
                description: !currentStatus ? GetLocalized(Messages.ServiceActivated) : GetLocalized(Messages.ServiceDeactivated)
            });
            setServiceTypes(prev => prev.map(s => s.serviceTypeId === id ? { ...s, isActive: !currentStatus } : s));
        } else {
            AGShowMessage.error({ title: GetLocalized(Labels.Error), description: response.error.message });
        }
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        const response = await serviceTypeService.deleteAsync(serviceToDelete.serviceTypeId);
        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Messages.Deleted), description: GetLocalized(Messages.ServiceTypeRemoved) });
            setServiceTypes(prev => prev.filter(s => s.serviceTypeId !== serviceToDelete.serviceTypeId));
        } else {
            AGShowMessage.error({ title: GetLocalized(Labels.Error), description: response.error.message });
        }
        setServiceToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{GetLocalized(Labels.ServiceTypes)}</h2>
                    <p className="text-muted-foreground">{GetLocalized(Labels.ServiceTypesDescription)}</p>
                </div>
                <Button onClick={handleOpenCreateDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.NewService)}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{GetLocalized(Labels.RegisteredServices)}</CardTitle>
                    <CardDescription>{GetLocalized(Labels.RegisteredServicesDescription)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative w-full md:max-w-md">
                            <Input
                                placeholder={GetLocalized(Labels.SearchServiceType)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
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
                        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as typeof filterStatus)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={GetLocalized(Labels.Status)} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{GetLocalized(Labels.All)}</SelectItem>
                                <SelectItem value="active">{GetLocalized(Labels.ActivePlural)}</SelectItem>
                                <SelectItem value="inactive">{GetLocalized(Labels.InactivePlural)}</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex-1 flex justify-end">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchData}
                                disabled={loading}
                                title={GetLocalized(Labels.ReloadGrid)}
                                className="h-10 w-10"
                            >
                                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <ServiceTypeTable
                        serviceTypes={filteredServices}
                        queues={queues}
                        loading={loading}
                        onEdit={handleOpenEditDialog}
                        onToggleStatus={handleToggleStatus}
                        onDelete={setServiceToDelete}
                    />
                </CardContent>
            </Card>

            <ServiceTypeFormDialog
                target={formTarget}
                queues={queues}
                onClose={() => setFormTarget(null)}
                onSaved={fetchData}
            />

            <ConfirmDialog
                open={!!serviceToDelete}
                onOpenChange={(open) => !open && setServiceToDelete(null)}
                title={GetLocalized(Labels.DeleteService)}
                description={`${GetLocalized(Messages.ConfirmDeleteService)} "${serviceToDelete?.title}"?`}
                onConfirm={handleDelete}
                confirmText={GetLocalized(Labels.ConfirmDeletion)}
            />
        </div>
    );
};
