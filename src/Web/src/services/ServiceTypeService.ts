import type { ServiceResult } from "../models/baseServiceModels";
import type {
  ServiceTypeRequest,
  ServiceTypeSummary,
  ServiceTypeView
} from "../models/ServiceTypeModels";
import { BaseService } from "./BaseService";
import type { IServiceTypeService } from "./interfaces/IServiceTypeService";

class ServiceTypeService extends BaseService implements IServiceTypeService {
  private readonly _endpoint = "/totem/ServiceType";

  public async getByIdAsync(id: string): Promise<ServiceResult<ServiceTypeView>> {
    return this.GetAsync<ServiceTypeView>(`${this._endpoint}/${id}`);
  }

  public async getActiveServicesAsync(): Promise<ServiceResult<ServiceTypeSummary[]>> {
    return this.GetAsync<ServiceTypeSummary[]>(`${this._endpoint}/active`);
  }

  public async getAllAsync(): Promise<ServiceResult<ServiceTypeSummary[]>> {
    return this.GetAsync<ServiceTypeSummary[]>(this._endpoint);
  }

  public async createAsync(request: ServiceTypeRequest): Promise<ServiceResult<string>> {
    return this.PostAsync<string, ServiceTypeRequest>(this._endpoint, request, true);
  }

  public async updateAsync(id: string, request: ServiceTypeRequest): Promise<ServiceResult<void>> {
    return this.PutAsync<void, ServiceTypeRequest>(`${this._endpoint}/${id}`, request);
  }

  public async toggleStatusAsync(id: string): Promise<ServiceResult<void>> {
    return this.PatchAsync<void, undefined>(`${this._endpoint}/${id}/toggle-status`, undefined);
  }

  public async disableAsync(id: string): Promise<ServiceResult<void>> {
    return this.PatchAsync<void, undefined>(`${this._endpoint}/${id}/disable`, undefined);
  }

  public async deleteAsync(id: string): Promise<ServiceResult<void>> {
    return this.DeleteAsync<void>(`${this._endpoint}/${id}`);
  }
}

export const serviceTypeService = new ServiceTypeService();
