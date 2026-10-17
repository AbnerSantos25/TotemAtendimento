import type { IClinicSettingsService } from "./interfaces/IClinicSettingsService";
import { ClinicSettingsMockService } from "./mocks/ClinicSettingsMockService";

/**
 * Ponto único de troca: quando o backend estiver pronto, criar
 * `ClinicSettingsService extends BaseService` e instanciá-lo aqui.
 */
export const clinicSettingsService: IClinicSettingsService = new ClinicSettingsMockService();
