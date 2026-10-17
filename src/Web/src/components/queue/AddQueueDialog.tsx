import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AGShowMessage } from "@/components/AGShowMessage";
import { queueService } from "@/services/QueueService";
import type { QueueView } from "@/models/QueueModels";
import { GetLocalized } from '@/shared/localization/i18n';
import { Labels, Messages, Errors } from '@/shared/localization/keys';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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

const QueueSchema = z.object({
    name: z.string().min(1, { message: GetLocalized(Errors.QueueNameRequired) }),
    isActive: z.boolean()
});
type QueueFormValues = z.infer<typeof QueueSchema>;

interface AddQueueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (queue: QueueView) => void;
}

export function AddQueueDialog({ open, onOpenChange, onCreated }: AddQueueDialogProps) {
    const form = useForm<QueueFormValues>({
        resolver: zodResolver(QueueSchema),
        defaultValues: {
            name: "",
            isActive: true,
        },
    });

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) {
            form.reset();
        }
    };

    const onSubmit = async (values: QueueFormValues) => {
        const dto = { name: values.name, isActive: values.isActive };
        const response = await queueService.createQueueAsync(dto);

        if (response.success && response.data) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.QueueCreatedSuccess) });
            onCreated({ id: response.data, name: dto.name, isActive: dto.isActive });
            handleOpenChange(false);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.CreationError), description: response.error.message || GetLocalized(Errors.QueueCreationFailed) });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
    );
}
