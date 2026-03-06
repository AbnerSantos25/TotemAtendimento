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

export interface AuthData {
    jwt: string;
    newToken: string;
    userView: UserView
}

export interface UserView {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
}