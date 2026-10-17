import type { ServiceResult } from "../models/baseServiceModels";
import type { OrganizationSettingsRequest, OrganizationSettingsView } from "../models/OrganizationSettingsModels";
import { BaseService } from "./BaseService";
import type { IOrganizationSettingsService } from "./interfaces/IOrganizationSettingsService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class OrganizationSettingsService extends BaseService implements IOrganizationSettingsService {
    private readonly basePath = "/totem/OrganizationSettings";

    // A API devolve a logo como caminho relativo a ela; a <img> precisa do endereco completo.
    private withAbsoluteLogoUrl(result: ServiceResult<OrganizationSettingsView>): ServiceResult<OrganizationSettingsView> {
        if (result.success && result.data?.logoUrl) {
            result.data.logoUrl = `${API_BASE_URL}${result.data.logoUrl}`;
        }
        return result;
    }

    public async getAsync(): Promise<ServiceResult<OrganizationSettingsView>> {
        return this.withAbsoluteLogoUrl(await this.GetAsync<OrganizationSettingsView>(this.basePath));
    }

    public async updateAsync(dto: OrganizationSettingsRequest): Promise<ServiceResult<OrganizationSettingsView>> {
        const form = new FormData();
        form.append("name", dto.name);
        form.append("cnpj", dto.cnpj);
        form.append("websiteUrl", dto.websiteUrl);

        // A tela trabalha com data URL: logo nova vira arquivo, null remove, URL da API significa "sem mudanca".
        if (dto.logoUrl?.startsWith("data:")) {
            form.append("logo", await (await fetch(dto.logoUrl)).blob(), "logo");
        } else if (dto.logoUrl === null) {
            form.append("removeLogo", "true");
        }

        return this.withAbsoluteLogoUrl(await this.PutAsync<OrganizationSettingsView, FormData>(this.basePath, form));
    }
}

export const organizationSettingsService: IOrganizationSettingsService = new OrganizationSettingsService();
