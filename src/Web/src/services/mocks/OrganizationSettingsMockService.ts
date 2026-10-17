import type { ServiceResult } from "../../models/baseServiceModels";
import type { OrganizationSettingsRequest, OrganizationSettingsView } from "../../models/OrganizationSettingsModels";
import type { IOrganizationSettingsService } from "../interfaces/IOrganizationSettingsService";

const STORAGE_KEY = "organizationSettings";
const SIMULATED_LATENCY_MS = 300;

const DEFAULT_SETTINGS: OrganizationSettingsView = {
    name: "Minha Organização",
    cnpj: "11222333000181",
    websiteUrl: "exemplo.com.br",
    logoUrl: null,
};

const delay = () => new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

/**
 * Implementação mockada (localStorage) para desenvolver sem a API.
 * Para usar, troque o export em services/OrganizationSettingsService.ts por esta classe.
 */
export class OrganizationSettingsMockService implements IOrganizationSettingsService {

    public async getAsync(): Promise<ServiceResult<OrganizationSettingsView>> {
        await delay();
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const data = raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<OrganizationSettingsView>) } : DEFAULT_SETTINGS;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: { statusCode: 500, message: String(error) } };
        }
    }

    public async updateAsync(dto: OrganizationSettingsRequest): Promise<ServiceResult<OrganizationSettingsView>> {
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
