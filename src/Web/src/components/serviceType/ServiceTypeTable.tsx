import type { ServiceTypeSummary } from "@/models/ServiceTypeModels";
import type { QueueView } from "@/models/QueueModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages } from "@/shared/localization/keys";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActionsMenu } from "@/components/RowActionsMenu";
import { ServiceTypeIcon } from "@/components/serviceType/ServiceTypeIcon";
import { FolderSearch, Pencil, Power, PowerOff, Trash2 } from "lucide-react";

interface ServiceTypeTableProps {
    serviceTypes: ServiceTypeSummary[];
    queues: QueueView[];
    loading: boolean;
    onEdit: (service: ServiceTypeSummary) => void;
    onToggleStatus: (service: ServiceTypeSummary) => void;
    onDelete: (service: ServiceTypeSummary) => void;
}

export function ServiceTypeTable({ serviceTypes, queues, loading, onEdit, onToggleStatus, onDelete }: ServiceTypeTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{GetLocalized(Labels.Service)}</TableHead>
                        <TableHead>{GetLocalized(Labels.Color)}</TableHead>
                        <TableHead>{GetLocalized(Labels.Prefix)}</TableHead>
                        <TableHead>{GetLocalized(Labels.TargetQueue)}</TableHead>
                        <TableHead>{GetLocalized(Labels.Status)}</TableHead>
                        <TableHead className="w-[100px] text-right">{GetLocalized(Labels.Actions)}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableSkeleton columns={6} rows={5} />
                    ) : serviceTypes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="p-0">
                                <EmptyState
                                    title={GetLocalized(Messages.NoServiceFound)}
                                    description={GetLocalized(Messages.NoResultMatchesFilters)}
                                    icon={<FolderSearch className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        serviceTypes.map((service) => (
                            <TableRow key={service.serviceTypeId}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-lg flex items-center justify-center min-w-[40px]">
                                            <ServiceTypeIcon icon={service.icon} className="text-xl" />
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
                                    <StatusBadge isActive={service.isActive} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <RowActionsMenu>
                                        <DropdownMenuItem onSelect={() => onEdit(service)}>
                                            <Pencil /> {GetLocalized(Labels.Edit)}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onToggleStatus(service)}>
                                            {service.isActive
                                                ? <><PowerOff /> {GetLocalized(Labels.Deactivate)}</>
                                                : <><Power /> {GetLocalized(Labels.Activate)}</>}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(service)}>
                                            <Trash2 /> {GetLocalized(Labels.Delete)}
                                        </DropdownMenuItem>
                                    </RowActionsMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
