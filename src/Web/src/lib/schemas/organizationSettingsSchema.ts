import { z } from "zod";
import { GetLocalized } from "@/shared/localization/i18n";
import { Errors } from "@/shared/localization/keys";
import { normalizeCnpj, normalizeWebsite } from "@/lib/formatters";

export const LOGO_MAX_BYTES = 1024 * 1024;
export const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

/**
 * Valida CNPJ numérico ou alfanumérico pelos dígitos verificadores, com o mesmo algoritmo
 * do objeto de valor Cnpj no backend: cada caractere vale seu código ASCII menos 48.
 */
export const isValidCnpj = (value: string): boolean => {
    const cnpj = normalizeCnpj(value);
    if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj) || /^(.)\1{13}$/.test(cnpj)) return false;

    const calcDigit = (base: string) => {
        const weights = base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const sum = base.split("").reduce((acc, c, i) => acc + (c.charCodeAt(0) - 48) * weights[i], 0);
        const rest = sum % 11;
        return rest < 2 ? 0 : 11 - rest;
    };

    const d1 = calcDigit(cnpj.slice(0, 12));
    const d2 = calcDigit(cnpj.slice(0, 12) + d1);
    return cnpj.endsWith(`${d1}${d2}`);
};

const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(\/.*)?$/i;

/** Schema criado sob demanda para resolver as traduções após o i18n inicializar. */
export const createOrganizationSettingsSchema = () => z.object({
    name: z.string().trim().min(3, GetLocalized(Errors.OrganizationNameMinLength)),
    cnpj: z.string().refine(isValidCnpj, GetLocalized(Errors.InvalidCnpj)),
    websiteUrl: z.string().refine((v) => DOMAIN_REGEX.test(normalizeWebsite(v)), GetLocalized(Errors.InvalidWebsite)),
    logoUrl: z.string().nullable(),
});

export type OrganizationSettingsFormValues = z.infer<ReturnType<typeof createOrganizationSettingsSchema>>;
