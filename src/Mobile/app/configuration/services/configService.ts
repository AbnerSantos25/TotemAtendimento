import { 
  UserRequest,
  UserView 
} from '../models/UserModels';

export async function updateUserEmail(
  userId: string, 
  token: string, 
  request: UserRequest
): Promise<UserView> {
  
  const url = `user/${userId}/update-email`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request), // Envia o DTO de Requisição
  });

  if (response.status === 200 || response.status === 201) {
    // Sucesso: Retorna o novo perfil completo ou apenas os dados necessários
    const data: UserView = await response.json(); 
    return data;
  }
  
  // Trata falhas de rede ou servidor
  throw new Error("Não foi possível alterar o nome. Tente novamente.");
}
