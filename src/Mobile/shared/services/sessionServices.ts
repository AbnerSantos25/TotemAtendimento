import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthData, Status } from "../models/baseServiceModels";
import { UserView } from "../models/commonModels";

const JWT_KEY = "jwt";
const REFRESH_TOKEN_KEY = "newToken";
const STATUS_KEY = "status";
const USER_DATA = "userView"

export class SessionService {

  static async saveAuthDataAsync(authData: AuthData): Promise<void> {
    try {
      await AsyncStorage.setItem(JWT_KEY, authData.jwt);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, authData.newToken);
      await AsyncStorage.setItem(USER_DATA, JSON.stringify(authData.userView))

      await this.saveStatusAsync(Status.loggedIn);
    } catch (error) {
      console.error("Erro ao salvar dados de autenticação", error);
    }
  }

  static async saveUserAsync(user: UserView): Promise<void> {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(user));
    } catch (error) {
      console.error("Erro ao salvar dados do usuário", error);
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

  static async getUserAsync(): Promise<UserView | null>{
    try {
      const jsonValue = await AsyncStorage.getItem(USER_DATA);
      let userViewConverted = jsonValue != null ? JSON.parse(jsonValue) as UserView : null;
      return userViewConverted;
    } catch (error) {
      console.error("Erro ao resgatar usuário - ", error);
      return null;
    }
  }
}