import { AuthData } from "../../../shared/models/baseServiceModels";
import { BaseService } from "../../../shared/services/baseService";
import { UserRequest } from "../models/UserModels";

export class LoginServices{

    static async TryLoginAsync(loginRequest: UserRequest){
        return await BaseService.PostAsync<AuthData, UserRequest>("/totem/identity/login", loginRequest, false)
    }
}