import { useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceLocationService } from "@/services/ServiceLocationService";
import type { ServiceLocationView } from "@/models/ServiceLocationModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ServiceLocationSchema = z.object({
    name: z.string().min(3, GetLocalized(Errors.LocationNameMinLength)),
    number: z.number().nullable().optional(),
});

type ServiceLocationValues = z.infer<typeof ServiceLocationSchema>;

interface ServiceLocationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: ServiceLocationView | null; // null = criação
    onSaved: (location: ServiceLocationView) => void;
}

export function ServiceLocationFormDialog({ open, onOpenChange, location, onSaved }: ServiceLocationFormDialogProps) {
    const form = useForm<ServiceLocationValues>({
        resolver: zodResolver(ServiceLocationSchema),
        defaultValues: {
            name: "",
            number: null
        }
    });

    const { reset } = form;
    useEffect(() => {
        if (open) reset({ name: location?.name ?? "", number: location?.number ?? null });
    }, [open, location, reset]);

    const handleSaveLocation = async (data: ServiceLocationValues) => {
        const id = location?.id ?? null;
        const dto = { id, name: data.name, number: data.number };

        if (id) {
            const response = await serviceLocationService.updateAsync(id, dto);
            if (response.success && response.data) {
                AGShowMessage.success({ title: GetLocalized(Messages.SuccessTitle), description: GetLocalized(Messages.LocationUpdatedSuccess) });
                onSaved({ id, name: dto.name, number: dto.number });
                onOpenChange(false);
            } else if (!response.success && response.error) {
                AGShowMessage.error({ title: GetLocalized(Errors.UpdateErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToUpdateLocation) });
            }
        } else {
            const response = await serviceLocationService.addAsync(dto);
            if (response.success && response.data) {
                AGShowMessage.success({ title: GetLocalized(Messages.SuccessTitle), description: GetLocalized(Messages.LocationCreatedSuccess) });
                onSaved({ id: response.data, name: dto.name, number: dto.number });
                onOpenChange(false);
            } else if (!response.success && response.error) {
                AGShowMessage.error({ title: GetLocalized(Errors.CreationErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToCreateLocation) });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{location ? GetLocalized(Labels.EditLocationDialogTitle) : GetLocalized(Labels.AddNewLocationDialogTitle)}</DialogTitle>
                    <DialogDescription>
                        {location ? GetLocalized(Labels.EditLocationDialogDescription) : GetLocalized(Labels.AddLocationDialogDescription)}
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
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {GetLocalized(Labels.CancelButton)}
                            </Button>
                            <Button type="submit">
                                {location ? GetLocalized(Labels.SaveChangesButton) : GetLocalized(Labels.SaveLocationButton)}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
