import { useContext } from 'react';
import { ClinicSettingsContext } from '@/contexts/clinicSettingsContextDef';

export function useClinicSettings() {
    const context = useContext(ClinicSettingsContext);

    if (!context) {
        throw new Error('useClinicSettings deve ser usado dentro de um ClinicSettingsProvider');
    }

    return context;
}
