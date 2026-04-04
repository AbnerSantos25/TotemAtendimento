import { BaseService } from "./BaseService";
import type { ServiceResult } from "../models/baseServiceModels";
import type { 
    ServiceLocationView, 
    ServiceLocationRequest, 
    ServiceLocationReadyRequest 
} from "../models/ServiceLocationModels";
import type { IServiceLocationService } from "./interfaces/IServiceLocationService";

export class ServiceLocationService extends BaseService implements IServiceLocationService {
    private readonly basePath = "/totem/ServiceLocation";

    public async getListAsync(): Promise<ServiceResult<ServiceLocationView[]>> {
        return this.GetAsync<ServiceLocationView[]>(this.basePath);
    }

    public async getByIdAsync(id: string): Promise<ServiceResult<ServiceLocationView>> {
        return this.GetAsync<ServiceLocationView>(`${this.basePath}/${id}`);
    }

    public async addAsync(request: ServiceLocationRequest): Promise<ServiceResult<string>> {
        return this.PostAsync<string, ServiceLocationRequest>(this.basePath, request);
    }

    public async updateAsync(id: string, request: ServiceLocationRequest): Promise<ServiceResult<ServiceLocationView>> {
        return this.PutAsync<ServiceLocationView, ServiceLocationRequest>(`${this.basePath}/${id}`, request);
    }

    public async deleteAsync(id: string): Promise<ServiceResult<void>> {
        return this.DeleteAsync<void>(`${this.basePath}/${id}`);
    }

    public async notifyAvailableAsync(id: string, request: ServiceLocationReadyRequest): Promise<ServiceResult<string>> {
        return this.PostAsync<string, ServiceLocationReadyRequest>(`${this.basePath}/${id}/ready`, request);
    }
}

export const serviceLocationService = new ServiceLocationService();
