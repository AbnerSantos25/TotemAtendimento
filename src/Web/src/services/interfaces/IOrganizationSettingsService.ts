import type { ServiceResult } from "../../models/baseServiceModels";
import type { OrganizationSettingsRequest, OrganizationSettingsView } from "../../models/OrganizationSettingsModels";

export interface IOrganizationSettingsService {
    getAsync(): Promise<ServiceResult<OrganizationSettingsView>>;
    updateAsync(dto: OrganizationSettingsRequest): Promise<ServiceResult<OrganizationSettingsView>>;
}
