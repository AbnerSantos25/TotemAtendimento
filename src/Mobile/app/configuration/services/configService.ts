import { AGMessageType, AGShowMessage } from '../../../shared/components/AGShowMessage';
import { BaseService } from '../../../shared/services/baseService';
import { UserRequest, } from '../models/UserModels';
import { SessionService } from '../../../shared/services/sessionServices';
import { UserView } from '../../../shared/models/commonModels';
import { ServiceResult } from '../../../shared/models/baseServiceModels';


export const ConfigurationService = {

  async UpdateUserEmailAsync(request: UserRequest): Promise<UserView> {
  const response = await BaseService.PutAsync<UserView, UserRequest>("/totem/identity/email-update", request);
  if (response.success) {
    AGShowMessage(AGMessageType.success);
      return response.data;
    }else{
      AGShowMessage(response.error.message, AGMessageType.error);
      console.error(response.error.message);
    }
    throw response.error.message;
  },

  GetLoggedUserAsync: async (): Promise<ServiceResult<UserView>> => {
    try {
      const user = await SessionService.getUserAsync();

      if (user) {
        return { 
          success: true, 
          data: user 
        };
      } else {
        return { 
          success: false, 
          error: {
            statusCode: 404,
            message: "Nenhum usuário logado encontrado localmente.",
          } 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: {
          statusCode: 500,
          message: "Erro ao recuperar dados do usuário.",
          // body: JSON.stringify(error)
        } 
      };
    }
  },
}
