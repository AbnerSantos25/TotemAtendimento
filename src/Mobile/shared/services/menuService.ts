import { MenuQueue, QueueRequest } from "../models/menuModels";
import { BaseService } from "./baseService";
import { ServiceResult } from "../models/baseServiceModels";

export const MenuService = {

    getAvailableMenus: async (): Promise<MenuQueue[]> => {
        // TODO<Gabriel> Por enquanto simulação, timeout, e retorno dados estaticos. Substituir por uma requisição, para obter os dados da entidade de Menu, quando esta existir.
        await new Promise(resolve => setTimeout(resolve, 500));

        return [
            {
                name: "Atendimento Geral",
                queueId: "5cd16e0e-e818-4fc9-a206-6957afdf4167",
                preferential: true
            },
            {
                name: "Retirada de Exames",
                queueId: "b8dd2fec-7b5b-4ace-96c3-054901a6829f",
                preferential: false
            }
        ];
    },

    generatePassword: async (request: QueueRequest): Promise<ServiceResult<any>> => {
        return await BaseService.PostAsync<any, QueueRequest>("/totem/Password", request, true);
    }
};