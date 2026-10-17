import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceLocationService } from "@/services/ServiceLocationService";
import type { ServiceLocationView } from "@/models/ServiceLocationModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ServiceLocationTable } from "@/components/serviceLocation/ServiceLocationTable";
import { ServiceLocationFormDialog } from "@/components/serviceLocation/ServiceLocationFormDialog";

export function ServiceLocationConfiguration() {
    const [locations, setLocations] = useState<ServiceLocationView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<ServiceLocationView | null>(null);
    const [locationToDelete, setLocationToDelete] = useState<ServiceLocationView | null>(null);

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
        setLocationToEdit(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (loc: ServiceLocationView) => {
        setLocationToEdit(loc);
        setIsDialogOpen(true);
    };

    const handleSaved = (saved: ServiceLocationView) => {
        setLocations(prev => prev.some(loc => loc.id === saved.id)
            ? prev.map(loc => loc.id === saved.id ? saved : loc)
            : [...prev, saved]);
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

                    <ServiceLocationTable
                        locations={filteredLocations}
                        loading={loading}
                        onAdd={openAddDialog}
                        onEdit={openEditDialog}
                        onDelete={setLocationToDelete}
                    />
                </CardContent>
            </Card>

            <ServiceLocationFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                location={locationToEdit}
                onSaved={handleSaved}
            />

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
