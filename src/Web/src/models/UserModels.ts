export interface UserSummary {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    roles: string[];
}

export interface RegisterUserRequest {
    fullName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
}

// TODO <AI-Generated>: futuramente removeremos isto, e passaremos a exibir a string recebida em UserSummary (decodificado do JWT)
export const Role = {
    Admin: 1,
    User: 2,
    Manager: 3,
    System: 4,
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const RoleLabels: Record<Role, string> = {
    [Role.Admin]: "Administrador",
    [Role.User]: "Usuário",
    [Role.Manager]: "Gerente",
    [Role.System]: "Sistema",
};

export interface AssignRoleRequest {
    userId: string;
    role: Role;
}

export interface UpdateUserRolesRequest {
    userId: string;
    roles: Role[];
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface SetUserQueuePermissionsRequest {
    queueIds: string[];
}
