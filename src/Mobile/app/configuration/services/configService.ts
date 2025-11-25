import { AGMessageType, AGShowMessage } from '../../../shared/components/AGShowMessage';
import { BaseService } from '../../../shared/services/baseService';
import { 
  UserRequest,
  UserView 
} from '../models/UserModels';

export async function UpdateUserEmail(request: UserRequest): Promise<UserView> {

  const response = await BaseService.PutAsync<UserView, UserRequest>("/totem/identity/email-update", request);
  if (response.success) {
    AGShowMessage(AGMessageType.success);
    return response.data;
  }else{
    AGShowMessage(response.error.message, AGMessageType.error);
    console.error(response.error.message);
  }
  throw response.error.message;
}
