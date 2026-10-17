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
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActionsMenu } from "@/components/RowActionsMenu";
import { Plus, Trash2, FolderSearch, Power, PowerOff } from "lucide-react";

interface QueueTableProps {
    queues: QueueView[];
    loading: boolean;
    onAdd: () => void;
    onToggleStatus: (queue: QueueView) => void;
    onDelete: (queue: QueueView) => void;
}

export function QueueTable({ queues, loading, onAdd, onToggleStatus, onDelete }: QueueTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{GetLocalized(Labels.QueueName)}</TableHead>
                        <TableHead>{GetLocalized(Labels.Status)}</TableHead>
                        <TableHead className="w-[100px] text-right">{GetLocalized(Labels.Actions)}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableSkeleton columns={3} rows={5} />
                    ) : queues.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="p-0">
                                <EmptyState
                                    title={GetLocalized(Labels.NoQueueFound)}
                                    description={GetLocalized(Messages.NoQueueFoundDescription)}
                                    icon={<FolderSearch className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                    action={
                                        <Button variant="outline" onClick={onAdd}>
                                            <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.CreateQueue)}
                                        </Button>
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        queues.map((queue) => (
                            <TableRow key={queue.id}>
                                <TableCell className="font-medium">{queue.name}</TableCell>
                                <TableCell>
                                    <StatusBadge isActive={queue.isActive} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <RowActionsMenu>
                                        <DropdownMenuItem onSelect={() => onToggleStatus(queue)}>
                                            {queue.isActive
                                                ? <><PowerOff /> {GetLocalized(Labels.Deactivate)}</>
                                                : <><Power /> {GetLocalized(Labels.Activate)}</>}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(queue)}>
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
