import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import type { UserSummary } from "@/models/UserModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserTable } from "@/components/user/UserTable";
import { AddUserDialog } from "@/components/user/AddUserDialog";
import { UserStatusDialog } from "@/components/user/UserStatusDialog";
import { AssignRolesDialog } from "@/components/user/AssignRolesDialog";
import { UserQueuesDialog } from "@/components/user/UserQueuesDialog";

export function UserConfiguration() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [userToToggleStatus, setUserToToggleStatus] = useState<UserSummary | null>(null);
    const [userToAssignRole, setUserToAssignRole] = useState<UserSummary | null>(null);
    const [userToConfigQueues, setUserToConfigQueues] = useState<UserSummary | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const response = await userService.getListUserAsync();

        if (response.success && response.data) {
            setUsers(response.data);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.SearchErrorTitle), description: response.error.message || GetLocalized(Errors.FailedToLoadUsers) });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const query = searchTerm.toLowerCase();
        if (searchTerm &&
            !user.fullName.toLowerCase().includes(query) &&
            !user.email.toLowerCase().includes(query)) {
            return false;
        }
        return true;
    });

    const openAddDialog = () => setIsAddDialogOpen(true);

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{GetLocalized(Labels.UserManagement)}</h2>
                    <p className="text-muted-foreground">{GetLocalized(Messages.UserManagementDescription)}</p>
                </div>
                <Button onClick={openAddDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.NewUser)}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{GetLocalized(Labels.SystemUsers)}</CardTitle>
                    <CardDescription>{GetLocalized(Messages.SystemUsersDescription)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 max-w-md relative">
                        <Input
                            placeholder={GetLocalized(Labels.SearchByNameOrEmail)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-8"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-70 hover:opacity-100 focus:outline-none focus:bg-accent"
                                title={GetLocalized(Labels.ClearSearch)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <UserTable
                        users={filteredUsers}
                        loading={loading}
                        onAdd={openAddDialog}
                        onConfigQueues={setUserToConfigQueues}
                        onAssignRole={setUserToAssignRole}
                        onToggleStatus={setUserToToggleStatus}
                    />
                </CardContent>
            </Card>

            <AddUserDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchUsers} />
            <UserStatusDialog user={userToToggleStatus} onClose={() => setUserToToggleStatus(null)} onSuccess={fetchUsers} />
            <AssignRolesDialog user={userToAssignRole} onClose={() => setUserToAssignRole(null)} onSuccess={fetchUsers} />
            <UserQueuesDialog user={userToConfigQueues} onClose={() => setUserToConfigQueues(null)} />
        </div>
    );
}
