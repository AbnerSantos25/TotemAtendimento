export interface UserRequest {
    FullName: string;
    email?: string;
    password?: string;
    profileImageUrl?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserView {
    id: string;
    name: string;
    email: string;
    isActive?: boolean;
    profileImageUrl?: string;
    roles?: string[];
}