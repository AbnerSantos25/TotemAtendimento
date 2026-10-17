import { useState } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import type { UserSummary } from "@/models/UserModels";
import { Role, RoleLabels } from "@/models/UserModels";
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

// O backend pode devolver o perfil pelo nome do enum, pelo id numérico ou pelo label
function toRoles(roleNames: string[]): Role[] {
    const roleValues = Object.values(Role) as number[];
    const roleLabelsEntries = Object.entries(RoleLabels);

    return roleNames.map(rName => {
        if (rName in Role) {
            return Role[rName as keyof typeof Role];
        }

        const numericId = Number(rName);
        if (!isNaN(numericId) && roleValues.includes(numericId)) {
            return numericId as Role;
        }

        const entryByLabel = roleLabelsEntries.find(([, label]) => label === rName);
        if (entryByLabel) return Number(entryByLabel[0]) as Role;

        return null;
    }).filter((r): r is Role => r !== null);
}

interface AssignRolesDialogProps {
    user: UserSummary | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignRolesDialog({ user, onClose, onSuccess }: AssignRolesDialogProps) {
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Recarrega os perfis marcados sempre que um novo usuário é aberto
    const [loadedUser, setLoadedUser] = useState<UserSummary | null>(null);
    if (user && user !== loadedUser) {
        setLoadedUser(user);
        setSelectedRoles(toRoles(user.roles || []));
    }

    const toggleRole = (role: Role) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        const response = await userService.updateUserRolesAsync({
            userId: user.id,
            roles: selectedRoles,
        });

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.RolesUpdatedSuccessfully).replace('{0}', user.fullName) });
            onClose();
            onSuccess();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorAssigningRolesTitle), description: response.error.message || GetLocalized(Errors.UnableToAssignRoles) });
        }

        setIsSaving(false);
    };

    return (
        <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{GetLocalized(Labels.ManageAccessRoles)}</DialogTitle>
                    <DialogDescription>
                        {GetLocalized(Messages.SelectRolesForUserText1)}<strong>{user?.fullName}</strong>{GetLocalized(Messages.SelectRolesForUserText2)}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {(Object.entries(RoleLabels) as [string, string][]).map(([value, label]) => {
                        const roleId = Number(value) as Role;
                        return (
                            <CheckboxOption
                                key={roleId}
                                id={`role-${roleId}`}
                                label={label}
                                checked={selectedRoles.includes(roleId)}
                                onToggle={() => toggleRole(roleId)}
                                disabled={isSaving}
                            />
                        );
                    })}
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
