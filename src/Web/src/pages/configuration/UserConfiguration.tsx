import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import { queueService } from "@/services/QueueService";
import type { UserSummary } from "@/models/UserModels";
import type { QueueView } from "@/models/QueueModels";
import { Role, RoleLabels } from "@/models/UserModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
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
import { PasswordInput } from "@/components/ui/password-input";
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
import { Plus, Users, X, UserX, UserCheck, ShieldPlus, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label as UILabel } from "@/components/ui/label";
import { z } from "zod";
import { passwordSchema } from "@/lib/schemas/passwordSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z.object({
    fullName: z.string().min(1, GetLocalized(Errors.FullNameRequired)),
    email: z.string().min(1, GetLocalized(Errors.EmailRequired)).email(GetLocalized(Errors.InvalidEmail)),
    password: passwordSchema,
    confirmPassword: z.string().min(1, GetLocalized(Errors.PasswordMinLength)),
}).refine((data) => data.password === data.confirmPassword, {
    message: GetLocalized(Errors.PasswordsDoNotMatch),
    path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userSchema>;

export function UserConfiguration() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [userToInactivate, setUserToInactivate] = useState<UserSummary | null>(null);
    const [isInactivating, setIsInactivating] = useState(false);

    const [userToActivate, setUserToActivate] = useState<UserSummary | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    const [userToAssignRole, setUserToAssignRole] = useState<UserSummary | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [isAssigningRole, setIsAssigningRole] = useState(false);

    const [userToConfigQueues, setUserToConfigQueues] = useState<UserSummary | null>(null);
    const [availableQueues, setAvailableQueues] = useState<QueueView[]>([]);
    const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);
    const [isConfiguringQueues, setIsConfiguringQueues] = useState(false);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

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

    const openAddDialog = () => {
        form.reset();
        setIsAddDialogOpen(true);
    };

    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: UserFormValues) => {
        const response = await userService.registerUserAsync(data);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.UserRegisteredSuccessfully) });
            setIsAddDialogOpen(false);
            fetchUsers();
        } else if (!response.success && response.error) {
            let desc = response.error.message || GetLocalized(Errors.UnableToRegisterUser);

            if (response.error.validationErrors) {
                const errors = Object.values(response.error.validationErrors).flat();
                if (errors.length > 0) {
                    desc = errors.join("\n");
                }
            }

            AGShowMessage.error({ title: GetLocalized(Errors.RegistrationFailureTitle), description: desc });
        }
    };

    const handleConfirmInactivate = async () => {
        if (!userToInactivate) return;

        setIsInactivating(true);
        const response = await userService.inactivateUserAsync(userToInactivate.id);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.UserInactivatedSuccessfully).replace('{0}', userToInactivate.fullName) });
            setUserToInactivate(null);
            fetchUsers();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorInactivatingTitle), description: response.error.message || GetLocalized(Errors.UnableToInactivateUser) });
        }

        setIsInactivating(false);
    };

    const handleConfirmActivate = async () => {
        if (!userToActivate) return;

        setIsActivating(true);
        const response = await userService.activateUserAsync(userToActivate.id);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.UserActivatedSuccessfully).replace('{0}', userToActivate.fullName) });
            setUserToActivate(null);
            fetchUsers();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorActivatingTitle), description: response.error.message || GetLocalized(Errors.UnableToActivateUser) });
        }

        setIsActivating(false);
    };

    const openAssignRoleDialog = (user: UserSummary) => {
        const roleValues = Object.values(Role) as number[];
        const roleLabelsEntries = Object.entries(RoleLabels);

        const currentRoles = (user.roles || []).map(rName => {
            if (rName in Role) {
                return Role[rName as keyof typeof Role];
            }

            const numericId = Number(rName);
            if (!isNaN(numericId) && roleValues.includes(numericId)) {
                return numericId as Role;
            }

            const entryByLabel = roleLabelsEntries.find(([_, label]) => label === rName);
            if (entryByLabel) return Number(entryByLabel[0]) as Role;

            return null;
        }).filter((r): r is Role => r !== null);

        setSelectedRoles(currentRoles);
        setUserToAssignRole(user);
    };

    const handleAssignRole = async () => {
        if (!userToAssignRole) return;

        setIsAssigningRole(true);
        const response = await userService.updateUserRolesAsync({
            userId: userToAssignRole.id,
            roles: selectedRoles,
        });

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.RolesUpdatedSuccessfully).replace('{0}', userToAssignRole.fullName) });
            setUserToAssignRole(null);
            fetchUsers();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorAssigningRolesTitle), description: response.error.message || GetLocalized(Errors.UnableToAssignRoles) });
        }

        setIsAssigningRole(false);
    };

    const toggleRole = (role: Role) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const openConfigQueuesDialog = async (user: UserSummary) => {
        setUserToConfigQueues(user);

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

    const handleSaveQueuePermissions = async () => {
        if (!userToConfigQueues) return;

        setIsConfiguringQueues(true);
        const response = await userService.setUserQueuePermissionsAsync(userToConfigQueues.id, selectedQueueIds);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.QueuePermissionsUpdated).replace('{0}', userToConfigQueues.fullName) });
            setUserToConfigQueues(null);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: GetLocalized(Errors.ErrorUpdatingPermissionsTitle), description: response.error.message || GetLocalized(Errors.UnableToUpdateQueuePermissions) });
        }

        setIsConfiguringQueues(false);
    };

    const toggleQueue = (queueId: string) => {
        setSelectedQueueIds(prev =>
            prev.includes(queueId)
                ? prev.filter(id => id !== queueId)
                : [...prev, queueId]
        );
    };

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

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{GetLocalized(Labels.FullName)}</TableHead>
                                    <TableHead>{GetLocalized(Labels.AccessEmail)}</TableHead>
                                    <TableHead className="w-[150px]">{GetLocalized(Labels.Roles)}</TableHead>
                                    <TableHead className="w-[100px]">{GetLocalized(Labels.Status)}</TableHead>
                                    <TableHead className="w-[100px] text-right">{GetLocalized(Labels.Actions)}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={5} rows={5} />
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <EmptyState
                                                title={GetLocalized(Labels.NoUserFound)}
                                                description={GetLocalized(Messages.RegisterNewUsersDescription)}
                                                icon={<Users className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                                action={
                                                    <Button variant="outline" onClick={openAddDialog}>
                                                        <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.RegisterUser)}
                                                    </Button>
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.fullName}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((role) => (
                                                            <Badge key={role} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                {role}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">{GetLocalized(Labels.None)}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.isActive ? (
                                                    <Badge variant="outline" className="border-green-500 text-green-600">{GetLocalized(Labels.Active)}</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-red-400 text-red-500">{GetLocalized(Labels.Inactive)}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={GetLocalized(Labels.ConfigureAllowedQueues)}
                                                    className="text-muted-foreground hover:text-primary"
                                                    onClick={() => openConfigQueuesDialog(user)}
                                                >
                                                    <ListChecks className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={GetLocalized(Labels.AssignRole)}
                                                    className="text-muted-foreground hover:text-primary"
                                                    onClick={() => openAssignRoleDialog(user)}
                                                >
                                                    <ShieldPlus className="h-4 w-4" />
                                                </Button>
                                                {user.isActive ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title={GetLocalized(Labels.InactivateUser)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setUserToInactivate(user)}
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title={GetLocalized(Labels.ActivateUser)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                                        onClick={() => setUserToActivate(user)}
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Cadastrar Usuário */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{GetLocalized(Labels.RegisterNewUser)}</DialogTitle>
                        <DialogDescription>
                            {GetLocalized(Messages.RegisterNewUserDescription)}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.FullName)}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="João da Silva" autoFocus disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.Email)}</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="joao@empresa.com" disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.AccessPassword)}</FormLabel>
                                        <FormControl>
                                            <PasswordInput disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.ConfirmPassword)}</FormLabel>
                                        <FormControl>
                                            <PasswordInput disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>{GetLocalized(Labels.Cancel)}</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? GetLocalized(Labels.Registering) : GetLocalized(Labels.RegisterAccount)}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* AlertDialog: Confirmar Inativação */}
            <AlertDialog open={!!userToInactivate} onOpenChange={(open) => { if (!open) setUserToInactivate(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{GetLocalized(Labels.InactivateUserTitle)}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {GetLocalized(Messages.ConfirmInactivateUserText1)}<strong>{userToInactivate?.fullName}</strong>{GetLocalized(Messages.ConfirmInactivateUserText2)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isInactivating}>{GetLocalized(Labels.Cancel)}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmInactivate}
                            disabled={isInactivating}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isInactivating ? GetLocalized(Labels.Inactivating) : GetLocalized(Labels.Inactivate)}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* AlertDialog: Confirmar Ativação */}
            <AlertDialog open={!!userToActivate} onOpenChange={(open) => { if (!open) setUserToActivate(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{GetLocalized(Labels.ActivateUserTitle)}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {GetLocalized(Messages.ConfirmActivateUserText1)}<strong>{userToActivate?.fullName}</strong>{GetLocalized(Messages.ConfirmActivateUserText2)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isActivating}>{GetLocalized(Labels.Cancel)}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmActivate}
                            disabled={isActivating}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {isActivating ? GetLocalized(Labels.Activating) : GetLocalized(Labels.Activate)}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Atribuir Perfil */}
            <Dialog open={!!userToAssignRole} onOpenChange={(open) => { if (!open) setUserToAssignRole(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{GetLocalized(Labels.ManageAccessRoles)}</DialogTitle>
                        <DialogDescription>
                            {GetLocalized(Messages.SelectRolesForUserText1)}<strong>{userToAssignRole?.fullName}</strong>{GetLocalized(Messages.SelectRolesForUserText2)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {(Object.entries(RoleLabels) as [string, string][]).map(([value, label]) => {
                            const roleId = Number(value) as Role;
                            const id = `role-${roleId}`;
                            return (
                                <div key={roleId} className="flex items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm hover:bg-accent/50 transition-colors">
                                    <Checkbox
                                        id={id}
                                        checked={selectedRoles.includes(roleId)}
                                        onCheckedChange={() => toggleRole(roleId)}
                                        disabled={isAssigningRole}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <UILabel
                                            htmlFor={id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {label}
                                        </UILabel>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserToAssignRole(null)} disabled={isAssigningRole}>{GetLocalized(Labels.Cancel)}</Button>
                        <Button onClick={handleAssignRole} disabled={isAssigningRole}>
                            {isAssigningRole ? GetLocalized(Labels.Saving) : GetLocalized(Labels.SaveChanges)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Configurar Filas */}
            <Dialog open={!!userToConfigQueues} onOpenChange={(open) => { if (!open) setUserToConfigQueues(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{GetLocalized(Labels.ConfigureAccessQueues)}</DialogTitle>
                        <DialogDescription>
                            {GetLocalized(Messages.SelectQueuesForUserText1)}<strong>{userToConfigQueues?.fullName}</strong>{GetLocalized(Messages.SelectQueuesForUserText2)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        {availableQueues.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">{GetLocalized(Messages.NoActiveQueueFound)}</p>
                        ) : (
                            availableQueues.map((queue) => {
                                const id = `queue-${queue.id}`;
                                return (
                                    <div key={queue.id} className="flex items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm hover:bg-accent/50 transition-colors">
                                        <Checkbox
                                            id={id}
                                            checked={selectedQueueIds.includes(queue.id)}
                                            onCheckedChange={() => toggleQueue(queue.id)}
                                            disabled={isConfiguringQueues}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <UILabel
                                                htmlFor={id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {queue.name}
                                            </UILabel>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserToConfigQueues(null)} disabled={isConfiguringQueues}>{GetLocalized(Labels.Cancel)}</Button>
                        <Button onClick={handleSaveQueuePermissions} disabled={isConfiguringQueues}>
                            {isConfiguringQueues ? GetLocalized(Labels.Saving) : GetLocalized(Labels.SaveChanges)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
