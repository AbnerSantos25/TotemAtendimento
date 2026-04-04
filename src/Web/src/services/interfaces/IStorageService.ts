import type { AuthData, UserView } from "@/models/AuthModels";

export interface IStorageService {
    saveAuthDataAsync(authData: AuthData): Promise<void>;
    saveUserAsync(user: UserView): Promise<void>;
    saveStatusAsync(status: number): Promise<void>;
    getJwtTokenAsync(): Promise<string | null>;
    getStatusAsync(): Promise<string | null>;
    clearSessionAsync(): Promise<void>;
    getUserAsync(): Promise<UserView | null>;
}