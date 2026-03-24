import type { AuthData, UserView } from "@/models/AuthModels";
import { Status } from "@/models/baseServiceModels";
import type { IStorageService } from "@/services/interfaces/IStorageService";

const JWT_KEY = "jwt";
const REFRESH_TOKEN_KEY = "newToken";
const STATUS_KEY = "status";
const USER_DATA = "userView";

class StorageService implements IStorageService {

    async saveAuthDataAsync(authData: AuthData): Promise<void> {
        try {
            localStorage.setItem(JWT_KEY, authData.jwt);
            localStorage.setItem(REFRESH_TOKEN_KEY, authData.newToken);
            localStorage.setItem(USER_DATA, JSON.stringify(authData.userView));

            await this.saveStatusAsync(Status.loggedIn);
        } catch (error) {
            console.error("Erro ao salvar dados de autenticação", error);
        }
    }

    async saveUserAsync(user: UserView): Promise<void> {
        try {
            localStorage.setItem(USER_DATA, JSON.stringify(user));
        } catch (error) {
            console.error("Erro ao salvar dados do usuário", error);
        }
    }

    async saveStatusAsync(status: number): Promise<void> {
        try {
            localStorage.setItem(STATUS_KEY, status.toString());
        } catch (error) {
            console.error("Erro ao salvar status", error);
        }
    }

    async getJwtTokenAsync(): Promise<string | null> {
        try {
            return Promise.resolve(localStorage.getItem(JWT_KEY));
        } catch (error) {
            console.error("Erro ao buscar JWT token", error);
            return Promise.resolve(null);
        }
    }

    async getStatusAsync(): Promise<string | null> {
        try {
            return Promise.resolve(localStorage.getItem(STATUS_KEY));
        } catch (error) {
            console.error("Erro ao buscar status", error);
            return Promise.resolve(null);
        }
    }

    async clearSessionAsync(): Promise<void> {
        try {
            localStorage.removeItem(JWT_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(USER_DATA);
            await this.saveStatusAsync(Status.loggedOut);
            window.dispatchEvent(new Event('onSessionExpired'));
        } catch (error) {
            console.log("Erro ao limpar sessão", error);
        }
    }

    async getUserAsync(): Promise<UserView | null> {
        try {
            const jsonValue = localStorage.getItem(USER_DATA);
            const userViewConverted = jsonValue != null ? JSON.parse(jsonValue) as UserView : null;
            return Promise.resolve(userViewConverted);
        } catch (error) {
            console.log("Erro ao resgatar usuário - ", error);
            return Promise.resolve(null);
        }
    }
}

// Exportamos o Singleton. O resto do seu sistema usará a constante 'session'
export const session = new StorageService();