import type { UserView } from "@/models/AuthModels";

export interface IStorageService {
    saveUserAsync(user: UserView): Promise<void>;
    saveStatusAsync(status: number): Promise<void>;
    getStatusAsync(): Promise<string | null>;
    clearSessionAsync(): Promise<void>;
    getUserAsync(): Promise<UserView | null>;
}