import { useState } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import type { UserSummary } from "@/models/UserModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserStatusDialogProps {
    user: UserSummary | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function UserStatusDialog({ user, onClose, onSuccess }: UserStatusDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Mantém o último usuário para o texto não trocar durante a animação de fechar
    const [shownUser, setShownUser] = useState(user);
    if (user && user !== shownUser) setShownUser(user);

    const inactivating = shownUser?.isActive ?? false;

    const handleConfirm = async () => {
        if (!user) return;

        setIsLoading(true);
        const response = inactivating
            ? await userService.inactivateUserAsync(user.id)
            : await userService.activateUserAsync(user.id);

        if (response.success) {
            const message = inactivating ? Messages.UserInactivatedSuccessfully : Messages.UserActivatedSuccessfully;
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(message).replace('{0}', user.fullName) });
            onClose();
            onSuccess();
        } else if (!response.success && response.error) {
            AGShowMessage.error(inactivating
                ? { title: GetLocalized(Errors.ErrorInactivatingTitle), description: response.error.message || GetLocalized(Errors.UnableToInactivateUser) }
                : { title: GetLocalized(Errors.ErrorActivatingTitle), description: response.error.message || GetLocalized(Errors.UnableToActivateUser) });
        }

        setIsLoading(false);
    };

    return (
        <AlertDialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{GetLocalized(inactivating ? Labels.InactivateUserTitle : Labels.ActivateUserTitle)}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {GetLocalized(inactivating ? Messages.ConfirmInactivateUserText1 : Messages.ConfirmActivateUserText1)}
                        <strong>{shownUser?.fullName}</strong>
                        {GetLocalized(inactivating ? Messages.ConfirmInactivateUserText2 : Messages.ConfirmActivateUserText2)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{GetLocalized(Labels.Cancel)}</AlertDialogCancel>
                    {inactivating ? (
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? GetLocalized(Labels.Inactivating) : GetLocalized(Labels.Inactivate)}
                        </AlertDialogAction>
                    ) : (
                        <AlertDialogAction
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {isLoading ? GetLocalized(Labels.Activating) : GetLocalized(Labels.Activate)}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
