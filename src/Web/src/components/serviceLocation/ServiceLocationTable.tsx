import type { ServiceLocationView } from "@/models/ServiceLocationModels";
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
import { RowActionsMenu } from "@/components/RowActionsMenu";
import { Plus, Trash2, MapPin, Pencil } from "lucide-react";

interface ServiceLocationTableProps {
    locations: ServiceLocationView[];
    loading: boolean;
    onAdd: () => void;
    onEdit: (location: ServiceLocationView) => void;
    onDelete: (location: ServiceLocationView) => void;
}

export function ServiceLocationTable({ locations, loading, onAdd, onEdit, onDelete }: ServiceLocationTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{GetLocalized(Labels.NameColumn)}</TableHead>
                        <TableHead>{GetLocalized(Labels.NumberColumn)}</TableHead>
                        <TableHead className="w-[100px] text-right">{GetLocalized(Labels.ActionsColumn)}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableSkeleton columns={3} rows={4} />
                    ) : locations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="p-0">
                                <EmptyState
                                    title={GetLocalized(Messages.NoLocationFound)}
                                    description={GetLocalized(Messages.RegisterLocationsHint)}
                                    icon={<MapPin className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                    action={
                                        <Button variant="outline" onClick={onAdd}>
                                            <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.CreateLocationButton)}
                                        </Button>
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        locations.map((loc) => (
                            <TableRow key={loc.id}>
                                <TableCell className="font-medium">{loc.name}</TableCell>
                                <TableCell>{loc.number !== null && loc.number !== undefined ? loc.number : "-"}</TableCell>
                                <TableCell className="text-right">
                                    <RowActionsMenu>
                                        <DropdownMenuItem onSelect={() => onEdit(loc)}>
                                            <Pencil /> {GetLocalized(Labels.Edit)}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(loc)}>
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
