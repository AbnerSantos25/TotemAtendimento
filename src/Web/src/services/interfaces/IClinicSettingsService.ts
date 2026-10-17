import type { ServiceResult } from "../../models/baseServiceModels";
import type { ClinicSettingsRequest, ClinicSettingsView } from "../../models/ClinicSettingsModels";

export interface IClinicSettingsService {
    getAsync(): Promise<ServiceResult<ClinicSettingsView>>;
    updateAsync(dto: ClinicSettingsRequest): Promise<ServiceResult<ClinicSettingsView>>;
}
