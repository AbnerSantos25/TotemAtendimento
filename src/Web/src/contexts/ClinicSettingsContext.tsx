import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ClinicSettingsRequest, ClinicSettingsView } from "@/models/ClinicSettingsModels";
import type { ServiceResult } from "@/models/baseServiceModels";
import { clinicSettingsService } from "@/services/ClinicSettingsService";
import { CLINIC_SETTINGS_STORAGE_KEY } from "@/services/mocks/ClinicSettingsMockService";
import { ClinicSettingsContext } from "./clinicSettingsContextDef";

export function ClinicSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<ClinicSettingsView | null>(null);
    const [loading, setLoading] = useState(true);

    const applyResult = useCallback((result: ServiceResult<ClinicSettingsView>) => {
        if (result.success) {
            setSettings(result.data);
        } else {
            console.error("[ClinicSettings] Failed to load", result.error);
        }
        setLoading(false);
    }, []);

    const refresh = useCallback(async () => {
        applyResult(await clinicSettingsService.getAsync());
    }, [applyResult]);

    const update = useCallback(async (dto: ClinicSettingsRequest) => {
        const result = await clinicSettingsService.updateAsync(dto);
        if (result.success) {
            setSettings(result.data);
        }
        return result;
    }, []);

    useEffect(() => {
        let active = true;
        const load = () => clinicSettingsService.getAsync().then((r) => active && applyResult(r));
        load();

        // Mantém o painel aberto em outra aba/TV sincronizado (enquanto mockado em localStorage)
        const onStorage = (e: StorageEvent) => {
            if (e.key === CLINIC_SETTINGS_STORAGE_KEY) load();
        };
        window.addEventListener("storage", onStorage);
        return () => {
            active = false;
            window.removeEventListener("storage", onStorage);
        };
    }, [applyResult]);

    const value = useMemo(() => ({ settings, loading, refresh, update }), [settings, loading, refresh, update]);

    return <ClinicSettingsContext.Provider value={value}>{children}</ClinicSettingsContext.Provider>;
}
