import { z } from "zod";
import { GetLocalized } from "@/shared/localization/i18n";
import { Errors } from "@/shared/localization/keys";
import { normalizeWebsite, onlyDigits } from "@/lib/formatters";

export const LOGO_MAX_BYTES = 1024 * 1024;
export const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

/** Valida CNPJ pelos dígitos verificadores. */
export const isValidCnpj = (value: string): boolean => {
    const cnpj = onlyDigits(value);
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    const calcDigit = (base: string) => {
        const weights = base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const sum = base.split("").reduce((acc, n, i) => acc + Number(n) * weights[i], 0);
        const rest = sum % 11;
        return rest < 2 ? 0 : 11 - rest;
    };

    const d1 = calcDigit(cnpj.slice(0, 12));
    const d2 = calcDigit(cnpj.slice(0, 12) + d1);
    return cnpj.endsWith(`${d1}${d2}`);
};

const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(\/.*)?$/i;

/** Schema criado sob demanda para resolver as traduções após o i18n inicializar. */
export const createClinicSettingsSchema = () => z.object({
    name: z.string().trim().min(3, GetLocalized(Errors.ClinicNameMinLength)),
    cnpj: z.string().refine(isValidCnpj, GetLocalized(Errors.InvalidCnpj)),
    websiteUrl: z.string().refine((v) => DOMAIN_REGEX.test(normalizeWebsite(v)), GetLocalized(Errors.InvalidWebsite)),
    logoUrl: z.string().nullable(),
});

export type ClinicSettingsFormValues = z.infer<ReturnType<typeof createClinicSettingsSchema>>;
