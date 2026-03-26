export interface UserSummary {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
}

export interface RegisterUserRequest {
    fullName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
}

export const Role = {
    Admin: 1,
    User: 2,
    Manager: 3,
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const RoleLabels: Record<Role, string> = {
    [Role.Admin]: "Administrador",
    [Role.User]: "Usuário",
    [Role.Manager]: "Gerente",
};

export interface AssignRoleRequest {
    userId: string;
    role: Role;
}
