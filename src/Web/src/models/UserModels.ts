export interface UserSummary {
    id: string;
    fullName: string;
    email: string;
}

export interface RegisterUserRequest {
    fullName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
}
