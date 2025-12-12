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
}
