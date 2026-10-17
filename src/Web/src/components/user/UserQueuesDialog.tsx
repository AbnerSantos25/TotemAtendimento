import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import { queueService } from "@/services/QueueService";
import type { UserSummary } from "@/models/UserModels";
import type { QueueView } from "@/models/QueueModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CheckboxOption } from "@/components/user/CheckboxOption";

interface UserQueuesDialogProps {
    user: UserSummary | null;
    onClose: () => void;
}

export function UserQueuesDialog({ user, onClose }: UserQueuesDialogProps) {
    const [availableQueues, setAvailableQueues] = useState<QueueView[]>([]);
    const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            const queuesResponse = await queueService.getAllQueuesAsync();
            if (queuesResponse.success && queuesResponse.data) {
                setAvailableQueues(queuesResponse.data.filter(q => q.isActive));
            }

            const permissionsResponse = await userService.getUserQueuePermissionsAsync(user.id);
            if (permissionsResponse.success && permissionsResponse.data) {
                setSelectedQueueIds(permissionsResponse.data);
            } else {
                setSelectedQueueIds([]);
            }
        };

        load();
    }, [user]);

    const toggleQueue = (queueId: string) => {
        setSelectedQueueIds(prev =>
            prev.includes(queueId)
                ? prev.filter(id => id !== queueId)
                : [...prev, queueId]
        );
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        const response = await userService.setUserQueuePermissionsAsync(user.id, selectedQueueIds);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.QueuePermissionsUpdated).replace('{0}', user.fullName) });
            onClose();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorUpdatingPermissionsTitle), description: response.error.message || GetLocalized(Errors.UnableToUpdateQueuePermissions) });
        }

        setIsSaving(false);
    };

    return (
        <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{GetLocalized(Labels.ConfigureAccessQueues)}</DialogTitle>
                    <DialogDescription>
                        {GetLocalized(Messages.SelectQueuesForUserText1)}<strong>{user?.fullName}</strong>{GetLocalized(Messages.SelectQueuesForUserText2)}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    {availableQueues.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">{GetLocalized(Messages.NoActiveQueueFound)}</p>
                    ) : (
                        availableQueues.map((queue) => (
                            <CheckboxOption
                                key={queue.id}
                                id={`queue-${queue.id}`}
                                label={queue.name}
                                checked={selectedQueueIds.includes(queue.id)}
                                onToggle={() => toggleQueue(queue.id)}
                                disabled={isSaving}
                            />
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>{GetLocalized(Labels.Cancel)}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? GetLocalized(Labels.Saving) : GetLocalized(Labels.SaveChanges)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
