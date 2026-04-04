import type { ServiceResult } from "../../models/baseServiceModels";
import type { ServiceLocationView, ServiceLocationRequest, ServiceLocationReadyRequest } from "../../models/ServiceLocationModels";

export interface IServiceLocationService {
    getListAsync(): Promise<ServiceResult<ServiceLocationView[]>>;
    getByIdAsync(id: string): Promise<ServiceResult<ServiceLocationView>>;
    addAsync(request: ServiceLocationRequest): Promise<ServiceResult<string>>;
    updateAsync(id: string, request: ServiceLocationRequest): Promise<ServiceResult<ServiceLocationView>>;
    deleteAsync(id: string): Promise<ServiceResult<void>>;
    notifyAvailableAsync(id: string, request: ServiceLocationReadyRequest): Promise<ServiceResult<string>>;
}
