export interface OrganizationSettingsView {
    name: string;
    /** Somente dígitos (14). */
    cnpj: string;
    /** Domínio sem protocolo, ex.: "www.exemplo.com.br". */
    websiteUrl: string;
    /** URL pública ou data URL (base64) enquanto o backend não suporta upload. */
    logoUrl: string | null;
}

export type OrganizationSettingsRequest = OrganizationSettingsView;
