import type { UserSummary } from "@/models/UserModels";
import { GetLocalized } from "@/shared/localization/i18n";
import { Errors, Labels, Messages } from "@/shared/localization/keys";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { RowActionsMenu } from "@/components/RowActionsMenu";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, Users, UserX, UserCheck, ShieldPlus, ListChecks } from "lucide-react";

interface UserTableProps {
    users: UserSummary[];
    loading: boolean;
    onAdd: () => void;
    onConfigQueues: (user: UserSummary) => void;
    onAssignRole: (user: UserSummary) => void;
    onToggleStatus: (user: UserSummary) => void;
}

export function UserTable({ users, loading, onAdd, onConfigQueues, onAssignRole, onToggleStatus }: UserTableProps) {
    return (
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
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="p-0">
                                <EmptyState
                                    title={GetLocalized(Errors.UserNotFound)}
                                    description={GetLocalized(Messages.RegisterNewUsersDescription)}
                                    icon={<Users className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                    action={
                                        <Button variant="outline" onClick={onAdd}>
                                            <Plus className="mr-2 h-4 w-4" /> {GetLocalized(Labels.RegisterUser)}
                                        </Button>
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
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
                                    <StatusBadge isActive={user.isActive} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <RowActionsMenu>
                                        <DropdownMenuItem onSelect={() => onConfigQueues(user)}>
                                            <ListChecks /> {GetLocalized(Labels.ConfigureAllowedQueues)}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onAssignRole(user)}>
                                            <ShieldPlus /> {GetLocalized(Labels.AssignRole)}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {user.isActive ? (
                                            <DropdownMenuItem variant="destructive" onSelect={() => onToggleStatus(user)}>
                                                <UserX /> {GetLocalized(Labels.InactivateUser)}
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onSelect={() => onToggleStatus(user)}>
                                                <UserCheck /> {GetLocalized(Labels.ActivateUser)}
                                            </DropdownMenuItem>
                                        )}
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
