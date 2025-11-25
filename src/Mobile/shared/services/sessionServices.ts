import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthData, Status } from "./models/baseServiceModels";

const JWT_KEY = "jwt";
const REFRESH_TOKEN_KEY = "newToken";
const STATUS_KEY = "status";

export class SessionService {

  static async saveAuthDataAsync(authData: AuthData): Promise<void> {
    try {
      await AsyncStorage.setItem(JWT_KEY, authData.jwt);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, authData.newToken);
      await this.saveStatusAsync(Status.loggedIn);
    } catch (error) {
      console.error("Erro ao salvar dados de autenticação", error);
    }
  }

  static async saveStatusAsync(status: Status): Promise<void> {
    try {
      await AsyncStorage.setItem(STATUS_KEY, status.toString());
    } catch (error) {
      console.error("Erro ao salvar status", error);
    }
  }

  static async getJwtTokenAsync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(JWT_KEY);
    } catch (error) {
      console.error("Erro ao buscar JWT token", error);
      return null;
    }
  }

  static async getStatusAsync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STATUS_KEY);
    } catch (error)
    {
      console.error("Erro ao buscar status", error);
      return null;
    }
  }

  static async clearSessionAsync(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JWT_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await this.saveStatusAsync(Status.loggedOut);
    } catch (error) {
      console.error("Erro ao limpar sessão", error);
    }
  }
}