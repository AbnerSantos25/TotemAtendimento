import type { ServiceResult } from "../../models/baseServiceModels";
import type { ClinicSettingsRequest, ClinicSettingsView } from "../../models/ClinicSettingsModels";
import type { IClinicSettingsService } from "../interfaces/IClinicSettingsService";

const STORAGE_KEY = "clinicSettings";
const SIMULATED_LATENCY_MS = 300;

const DEFAULT_SETTINGS: ClinicSettingsView = {
    name: "Clínica São Bento",
    cnpj: "11222333000181",
    websiteUrl: "clinicasaobento.com.br",
    logoUrl: null,
};

const delay = () => new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

/**
 * Implementação mockada (localStorage) enquanto o backend não expõe o endpoint.
 * TODO: substituir por ClinicSettingsService (BaseService - GET/PUT /totem/Clinic).
 */
export class ClinicSettingsMockService implements IClinicSettingsService {

    public async getAsync(): Promise<ServiceResult<ClinicSettingsView>> {
        await delay();
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const data = raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ClinicSettingsView>) } : DEFAULT_SETTINGS;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: { statusCode: 500, message: String(error) } };
        }
    }

    public async updateAsync(dto: ClinicSettingsRequest): Promise<ServiceResult<ClinicSettingsView>> {
        await delay();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dto));
            return { success: true, data: dto };
        } catch (error) {
            // QuotaExceededError quando a logo em base64 excede o limite do localStorage
            return { success: false, error: { statusCode: 500, message: String(error) } };
        }
    }
}

export const CLINIC_SETTINGS_STORAGE_KEY = STORAGE_KEY;
