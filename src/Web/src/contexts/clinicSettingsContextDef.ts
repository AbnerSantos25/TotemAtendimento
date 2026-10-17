import { createContext } from "react";
import type { ServiceResult } from "@/models/baseServiceModels";
import type { ClinicSettingsRequest, ClinicSettingsView } from "@/models/ClinicSettingsModels";

export interface ClinicSettingsContextData {
    settings: ClinicSettingsView | null;
    loading: boolean;
    refresh: () => Promise<void>;
    update: (dto: ClinicSettingsRequest) => Promise<ServiceResult<ClinicSettingsView>>;
}

export const ClinicSettingsContext = createContext<ClinicSettingsContextData | undefined>(undefined);
