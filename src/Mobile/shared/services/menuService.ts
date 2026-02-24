import { MenuQueue, QueueRequest } from "../models/menuModels";
import { BaseService } from "./baseService";
import { ServiceResult } from "../models/baseServiceModels";

export const MenuService = {

    getAvailableMenus: async (): Promise<MenuQueue[]> => {
        try {
            // Faz a requisição GET para a rota de serviços ativos criada na controller
            // Nota: Certifique-se de que o método GetAsync está implementado no seu BaseService
            const response = await BaseService.GetAsync<any[]>("/totem/servicetype/active");
            console.log("Resposta da API de Menus:", response);
            

            if (response.success && response.data) {
                // Mapeia o DTO que vem do Backend (ServiceTypeSummary) para o modelo do Frontend (MenuQueue)
                return response.data.map(item => ({
                    title: item.title,               // Mapeia o Title do C# para o name do Front
                    icon: item.icon,                 // Mapeia o ícone do C# para o ícone do Front
                    ticketPrefix: item.ticketPrefix, // Mapeia o prefixo do ticket
                    queueId: item.targetQueueId,    // Mapeia a Fila Alvo
                    preferential: false, // Assumindo que você tem essa flag na API
                    color: item.color               // Bônus: pega a cor dinâmica configurada no painel!
                }));
            }


            console.warn("Nenhum menu retornado pela API ou erro na requisição.");
            return [];
        } catch (error) {
            console.error("Erro de rede ao buscar menus do Totem:", error);
            return [];
        }
    },

    generatePassword: async (request: QueueRequest): Promise<ServiceResult<any>> => {
        console.log("Enviando requisição para gerar senha:", request);
        return await BaseService.PostAsync<any, QueueRequest>("/totem/Password", request, true);
    }
};