import { MenuQueue, QueueRequest } from "../models/menuModels";
import { BaseService } from "./baseService";
import { ServiceResult } from "../models/baseServiceModels";

export const MenuService = {

    getAvailableMenus: async (): Promise<MenuQueue[]> => {
        try {
            const response = await BaseService.GetAsync<any[]>("/totem/servicetype/active");


            if (response.success && response.data) {
                return response.data.map(item => ({
                    title: item.title,
                    icon: item.icon,
                    ticketPrefix: item.ticketPrefix,
                    queueId: item.targetQueueId,
                    preferential: false,
                    color: item.color
                }));
            }
            return [];
        } catch (error) {
            console.error("Erro de rede ao buscar menus do Totem:", error);
            return [];
        }
    },

    generatePassword: async (request: QueueRequest): Promise<ServiceResult<any>> => {
        return await BaseService.PostAsync<any, QueueRequest>("/totem/Password", request, true);
    }
};