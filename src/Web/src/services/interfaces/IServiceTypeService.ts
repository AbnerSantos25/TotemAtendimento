import type { ServiceResult } from "../../models/baseServiceModels";
import type { ServiceTypeRequest, ServiceTypeSummary, ServiceTypeView } from "../../models/ServiceTypeModels";

export interface IServiceTypeService {
  getByIdAsync(id: string): Promise<ServiceResult<ServiceTypeView>>;
  getActiveServicesAsync(): Promise<ServiceResult<ServiceTypeSummary[]>>;
  getAllAsync(): Promise<ServiceResult<ServiceTypeSummary[]>>;
  createAsync(request: ServiceTypeRequest): Promise<ServiceResult<string>>;
  updateAsync(id: string, request: ServiceTypeRequest): Promise<ServiceResult<void>>;
  toggleStatusAsync(id: string): Promise<ServiceResult<void>>;
  disableAsync(id: string): Promise<ServiceResult<void>>;
}
