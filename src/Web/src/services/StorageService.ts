import type { UserView } from "@/models/AuthModels";
import { Status } from "@/models/baseServiceModels";
import type { IStorageService } from "@/services/interfaces/IStorageService";

const STATUS_KEY = "status";
const USER_DATA = "userView";

class StorageService implements IStorageService {

    async saveUserAsync(user: UserView): Promise<void> {
        try {
            localStorage.setItem(USER_DATA, JSON.stringify(user));
            await this.saveStatusAsync(Status.loggedIn);
        } catch (error) {
            console.log("Erro ao salvar dados do usuário", error);
        }
    }

    async saveStatusAsync(status: number): Promise<void> {
        try {
            localStorage.setItem(STATUS_KEY, status.toString());
        } catch (error) {
            console.log("Erro ao salvar status", error);
        }
    }

    async getStatusAsync(): Promise<string | null> {
        try {
            return Promise.resolve(localStorage.getItem(STATUS_KEY));
        } catch (error) {
            console.log("Erro ao buscar status", error);
            return Promise.resolve(null);
        }
    }

    async clearSessionAsync(): Promise<void> {
        try {
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