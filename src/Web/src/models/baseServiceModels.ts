export interface ApiResponse<T> {
    success: boolean;
    data: T;
    errors?: string[];
}
export interface ApiError {
    statusCode: number;
    message: string;
    body?: string;
    validationErrors?: Record<string, string[]>;
}

export interface AuthData {
    jwt: string;
    newToken: string;
    userView: UserView
}

export interface UserView {
    id: number;
    name: string;
    email: string;
    profileImageUrl: string;
}

export const Status = {
    loggedIn: 1,
    loggedOut: 2
} as const;

export type Status = typeof Status[keyof typeof Status];

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: ApiError };

export default null