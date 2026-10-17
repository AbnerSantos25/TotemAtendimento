import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { OrganizationSettingsRequest, OrganizationSettingsView } from "@/models/OrganizationSettingsModels";
import type { ServiceResult } from "@/models/baseServiceModels";
import { organizationSettingsService } from "@/services/OrganizationSettingsService";
import { useAuth } from "@/hooks/useAuth";
import { OrganizationSettingsContext } from "./organizationSettingsContextDef";

export function OrganizationSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<OrganizationSettingsView | null>(null);
    const [loading, setLoading] = useState(true);

    const applyResult = useCallback((result: ServiceResult<OrganizationSettingsView>) => {
        if (result.success) {
            setSettings(result.data);
        } else {
            console.error("[OrganizationSettings] Failed to load", result.error);
        }
        setLoading(false);
    }, []);

    const refresh = useCallback(async () => {
        applyResult(await organizationSettingsService.getAsync());
    }, [applyResult]);

    const update = useCallback(async (dto: OrganizationSettingsRequest) => {
        const result = await organizationSettingsService.updateAsync(dto);
        if (result.success) {
            setSettings(result.data);
        }
        return result;
    }, []);

    // A API exige login: buscar so com usuario autenticado e de novo a cada login.
    // Sem isso, a busca feita na tela de login (401) deixava os dados vazios ate um F5.
    const userId = useAuth().user?.id;

    useEffect(() => {
        if (!userId) return;

        let active = true;
        organizationSettingsService.getAsync().then((r) => active && applyResult(r));
        return () => {
            active = false;
        };
    }, [userId, applyResult]);

    const value = useMemo(() => ({ settings, loading, refresh, update }), [settings, loading, refresh, update]);

    return <OrganizationSettingsContext.Provider value={value}>{children}</OrganizationSettingsContext.Provider>;
}
