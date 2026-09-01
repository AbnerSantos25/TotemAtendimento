import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceLocationService } from "@/services/ServiceLocationService";
import type { ServiceLocationView } from "@/models/ServiceLocationModels";

import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";

//#region import zod
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

//#endregion import zod

//#region Schema Zod
const ServiceLocationSchema = z.object({
    name: z.string().min(3, GetLocalized(Errors.LocationNameMinLength)),
    number: z.number().nullable().optional(),
});

type ServiceLocationValues = z.infer<typeof ServiceLocationSchema>;
//#endregion Schema Zod


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, MapPin, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ServiceLocationConfiguration() {
    const [locations, setLocations] = useState<ServiceLocationView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [locationIDToEdit, setLocationIdToEdit] = useState<string | null>(null);

    const [locationToDelete, setLocationToDelete] = useState<{ id: string, name: string } | null>(null);

    const form = useForm<ServiceLocationValues>({
        resolver: zodResolver(ServiceLocationSchema),
        defaultValues: {
            name: "",
            number: null
        }
    });

    const fetchLocations = async () => {
        setLoading(true);
        const response = await serviceLocationService.getListAsync();

        if (response.success && response.data) {
            setLocations(response.data);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.SearchErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToLoadLocations) });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const filteredLocations = locations.filter(loc => {
        if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const openAddDialog = () => {
        setLocationIdToEdit(null);
        form.reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (loc: ServiceLocationView) => {
        setLocationIdToEdit(loc.id);
        form.reset();
        form.setValue("name", loc.name);
        form.setValue("number", loc.number ?? undefined);
        setIsDialogOpen(true);
    };

    const handleSaveLocation = async (data: ServiceLocationValues) => {
        const dto = { id: locationIDToEdit, name: data.name, number: data.number };

        if (locationIDToEdit) {
            const response = await serviceLocationService.updateAsync(locationIDToEdit, dto);
            if (response.success && response.data) {
                AGShowMessage.success({ title: GetLocalized(Messages.SuccessTitle), description: GetLocalized(Messages.LocationUpdatedSuccess) });
                setLocations(prev => prev.map(loc => loc.id === locationIDToEdit ? dto as ServiceLocationView : loc));
            } else if (!response.success && response.error) {
                AGShowMessage.error({ title: GetLocalized(Errors.UpdateErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToUpdateLocation) });
            }
        } else {
            const response = await serviceLocationService.addAsync(dto);
            if (response.success && response.data) {
                AGShowMessage.success({ title: GetLocalized(Messages.SuccessTitle), description: GetLocalized(Messages.LocationCreatedSuccess) });

                const newLocation: ServiceLocationView = {
                    id: response.data,
                    name: dto.name,
                    number: dto.number
                };

                setLocations(prev => [...prev, newLocation]);
            } else if (!response.success && response.error) {
                AGShowMessage.error({ title: GetLocalized(Errors.CreationErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToCreateLocation) });
            }
        }

        setIsDialogOpen(false);
    };

    const handleDeleteLocation = async () => {
        if (!locationToDelete) return;

        const response = await serviceLocationService.deleteAsync(locationToDelete.id);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Messages.RemovedTitle), description: GetLocalized(Messages.LocationRemovedSuccess) });
            setLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.DeletionErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToDeleteLocation) });
        }
        setLocationToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{GetLocalized(Labels.ServiceLocationsTitle)}</h2>
                    <p className="text-muted-foreground">{GetLocalized(Labels.ServiceLocationsSubtitle)}</p>
                </div>
                <Button onClick={openAddDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.NewLocationButton)}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{GetLocalized(Labels.RegisteredLocationsTitle)}</CardTitle>
                    <CardDescription>{GetLocalized(Labels.RegisteredLocationsSubtitle)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 max-w-md relative">
                        <Input
                            placeholder={GetLocalized(Labels.SearchLocationPlaceholder)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-8"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-70 hover:opacity-100 focus:outline-none focus:bg-accent"
                                title={GetLocalized(Labels.ClearSearchTitle)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{GetLocalized(Labels.NameColumn)}</TableHead>
                                    <TableHead>{GetLocalized(Labels.NumberColumn)}</TableHead>
                                    <TableHead className="text-right">{GetLocalized(Labels.ActionsColumn)}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={3} rows={4} />
                                ) : filteredLocations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-0">
                                            <EmptyState
                                                title={GetLocalized(Messages.NoLocationFound)}
                                                description={GetLocalized(Messages.RegisterLocationsHint)}
                                                icon={<MapPin className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                                action={
                                                    <Button variant="outline" onClick={openAddDialog}>
                                                        <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.CreateLocationButton)}
                                                    </Button>
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLocations.map((loc) => (
                                        <TableRow key={loc.id}>
                                            <TableCell className="font-medium">{loc.name}</TableCell>
                                            <TableCell>{loc.number !== null && loc.number !== undefined ? loc.number : "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={() => openEditDialog(loc)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setLocationToDelete({ id: loc.id, name: loc.name })}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{locationIDToEdit ? GetLocalized(Labels.EditLocationDialogTitle) : GetLocalized(Labels.AddNewLocationDialogTitle)}</DialogTitle>
                        <DialogDescription>
                            {locationIDToEdit ? GetLocalized(Labels.EditLocationDialogDescription) : GetLocalized(Labels.AddLocationDialogDescription)}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveLocation)} className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.LocationNameLabel)}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={GetLocalized(Labels.LocationNamePlaceholder)} autoFocus {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                            </FormField>

                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.LocationNumberLabel)}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={GetLocalized(Labels.LocationNumberPlaceholder)}
                                                type="number"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    field.onChange(val === "" ? null : Number(val));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                            </FormField>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {GetLocalized(Labels.CancelButton)}
                                </Button>
                                <Button type="submit">
                                    {locationIDToEdit ? GetLocalized(Labels.SaveChangesButton) : GetLocalized(Labels.SaveLocationButton)}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!locationToDelete}
                onOpenChange={(open) => !open && setLocationToDelete(null)}
                title={GetLocalized(Labels.ConfirmDeletionTitle)}
                description={`${GetLocalized(Messages.ConfirmDeletePrefix)} "${locationToDelete?.name}"? ${GetLocalized(Messages.ConfirmDeleteSuffix)}`}
                onConfirm={handleDeleteLocation}
                confirmText={GetLocalized(Labels.ConfirmDeletionTitle)}
            />
        </div>
    );
}
