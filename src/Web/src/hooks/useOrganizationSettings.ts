import { useContext } from 'react';
import { OrganizationSettingsContext } from '@/contexts/organizationSettingsContextDef';

export function useOrganizationSettings() {
    const context = useContext(OrganizationSettingsContext);

    if (!context) {
        throw new Error('useOrganizationSettings deve ser usado dentro de um OrganizationSettingsProvider');
    }

    return context;
}
