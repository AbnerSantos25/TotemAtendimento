import { createContext } from "react";
import type { ServiceResult } from "@/models/baseServiceModels";
import type { OrganizationSettingsRequest, OrganizationSettingsView } from "@/models/OrganizationSettingsModels";

export interface OrganizationSettingsContextData {
    settings: OrganizationSettingsView | null;
    loading: boolean;
    refresh: () => Promise<void>;
    update: (dto: OrganizationSettingsRequest) => Promise<ServiceResult<OrganizationSettingsView>>;
}

export const OrganizationSettingsContext = createContext<OrganizationSettingsContextData | undefined>(undefined);
