import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthData, Status } from "../models/baseServiceModels";
import { BaseService } from "./baseService";
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
    } catch (error) {
      console.error("Erro ao buscar status", error);
      return null;
    }
  }

  static async clearSessionAsync(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JWT_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA);
      await this.saveStatusAsync(Status.loggedOut);
    } catch (error) {
      console.error("Erro ao limpar sessão", error);
    }
  }
  

  static async tryRefreshTokenAsync(isRefreshing: boolean): Promise<boolean> {
    try { 
      if (!isRefreshing) {

        var userData = await AsyncStorage.getItem(USER_DATA);
        var tokenId = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        var user = JSON.parse(userData!) as UserView;

        const response = await BaseService.GetAsync<AuthData>(`/totem/RefreshToken/user/${user.id}/token/${tokenId}`, false);

        if (!response.success) {
          console.error("Falha no refresh Token")
          return false;
        }

        await SessionService.saveAuthDataAsync(response.data);
        return true;

      }

      console.error("Cai no Loop Prevention, do Refresh Token")
      return false;

    } catch (error) {
      console.error("Catch Exception:", error);
      return false
    }
  }
}