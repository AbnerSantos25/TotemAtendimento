import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import type { UserSummary } from "@/models/UserModels";
import { Role, RoleLabels } from "@/models/UserModels";
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
import { Plus, Users, X, UserX, UserCheck, ShieldPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label as UILabel } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z.object({
    fullName: z.string().min(1, "O nome completo é obrigatório."),
    email: z.string().min(1, "O e-mail é obrigatório.").email("E-mail inválido."),
    password: z.string().min(6, "No mínimo 6 caracteres."),
    confirmPassword: z.string().min(6, "No mínimo 6 caracteres."),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
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
            AGShowMessage.error({ title: "Erro na Busca", description: response.error.message || "Falha ao carregar usuários." });
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
            AGShowMessage.success({ title: "Sucesso", description: "Usuário registrado com sucesso." });
            setIsAddDialogOpen(false);
            fetchUsers();
        } else if (!response.success && response.error) {
            let desc = response.error.message || "Não foi possível registrar o usuário.";

            if (response.error.validationErrors) {
                const errors = Object.values(response.error.validationErrors).flat();
                if (errors.length > 0) {
                    desc = errors.join("\n");
                }
            }

            AGShowMessage.error({ title: "Falha no Registro", description: desc });
        }
    };

    const handleConfirmInactivate = async () => {
        if (!userToInactivate) return;

        setIsInactivating(true);
        const response = await userService.inactivateUserAsync(userToInactivate.id);

        if (response.success) {
            AGShowMessage.success({ title: "Sucesso", description: `Usuário "${userToInactivate.fullName}" inativado com sucesso.` });
            setUserToInactivate(null);
            fetchUsers();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro ao Inativar", description: response.error.message || "Não foi possível inativar o usuário." });
        }

        setIsInactivating(false);
    };

    const handleConfirmActivate = async () => {
        if (!userToActivate) return;

        setIsActivating(true);
        const response = await userService.activateUserAsync(userToActivate.id);

        if (response.success) {
            AGShowMessage.success({ title: "Sucesso", description: `Usuário "${userToActivate.fullName}" ativado com sucesso.` });
            setUserToActivate(null);
            fetchUsers();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro ao Ativar", description: response.error.message || "Não foi possível ativar o usuário." });
        }

        setIsActivating(false);
    };

    const openAssignRoleDialog = (user: UserSummary) => {
        // Inicializa com as roles que o usuário já possui
        const currentRoles = (user.roles || []).map(rName => {
            const entryByLabel = Object.entries(RoleLabels).find(([_, label]) => label === rName);
            if (entryByLabel) return Number(entryByLabel[0]) as Role;

            const numericId = Number(rName);
            if (!isNaN(numericId) && Object.values(Role).includes(numericId as any)) {
                return numericId as Role;
            }

            const entryByKey = Object.entries(Role).find(([key]) => key === rName);
            if (entryByKey && typeof entryByKey[1] === "number") return entryByKey[1] as Role;

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
            AGShowMessage.success({ title: "Sucesso", description: `Perfis atualizados para "${userToAssignRole.fullName}" com sucesso.` });
            setUserToAssignRole(null);
            fetchUsers();
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro ao Atribuir Perfis", description: response.error.message || "Não foi possível atribuir os perfis." });
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

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h2>
                    <p className="text-muted-foreground">Adicione e gerencie os parceiros e administradores do sistema.</p>
                </div>
                <Button onClick={openAddDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Novo Usuário
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuários do Sistema</CardTitle>
                    <CardDescription>Lista completa de operadores e gestores cadastrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 max-w-md relative">
                        <Input
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-8"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-70 hover:opacity-100 focus:outline-none focus:bg-accent"
                                title="Limpar busca"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome Completo</TableHead>
                                    <TableHead>E-Mail de Acesso</TableHead>
                                    <TableHead className="w-[150px]">Perfis</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={5} rows={5} />
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <EmptyState
                                                title="Nenhum usuário encontrado"
                                                description="Cadastre novos usuários para habilitar o controle do Totem."
                                                icon={<Users className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                                action={
                                                    <Button variant="outline" onClick={openAddDialog}>
                                                        <Plus className="mr-2 h-4 w-4" /> Cadastrar Usuário
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
                                                        <span className="text-xs text-muted-foreground">Nenhum</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.isActive ? (
                                                    <Badge variant="outline" className="border-green-500 text-green-600">Ativo</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-red-400 text-red-500">Inativo</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Atribuir perfil"
                                                    className="text-muted-foreground hover:text-primary"
                                                    onClick={() => openAssignRoleDialog(user)}
                                                >
                                                    <ShieldPlus className="h-4 w-4" />
                                                </Button>
                                                {user.isActive ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Inativar usuário"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setUserToInactivate(user)}
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Ativar usuário"
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
                        <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo operador ou gestor. Este acesso servirá para logar na plataforma.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
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
                                        <FormLabel>E-mail</FormLabel>
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
                                        <FormLabel>Senha de Acesso</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" disabled={isSubmitting} {...field} />
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
                                        <FormLabel>Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Registrando..." : "Registrar Conta"}
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
                        <AlertDialogTitle>Inativar Usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja inativar o usuário <strong>{userToInactivate?.fullName}</strong>?
                            Ele perderá o acesso ao sistema imediatamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isInactivating}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmInactivate}
                            disabled={isInactivating}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isInactivating ? "Inativando..." : "Inativar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* AlertDialog: Confirmar Ativação */}
            <AlertDialog open={!!userToActivate} onOpenChange={(open) => { if (!open) setUserToActivate(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ativar Usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja ativar o usuário <strong>{userToActivate?.fullName}</strong>?
                            Ele voltará a ter acesso ao sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isActivating}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmActivate}
                            disabled={isActivating}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {isActivating ? "Ativando..." : "Ativar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Atribuir Perfil */}
            <Dialog open={!!userToAssignRole} onOpenChange={(open) => { if (!open) setUserToAssignRole(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gerenciar Perfis de Acesso</DialogTitle>
                        <DialogDescription>
                            Selecione os perfis que <strong>{userToAssignRole?.fullName}</strong> terá no sistema.
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
                        <Button variant="outline" onClick={() => setUserToAssignRole(null)} disabled={isAssigningRole}>Cancelar</Button>
                        <Button onClick={handleAssignRole} disabled={isAssigningRole}>
                            {isAssigningRole ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
