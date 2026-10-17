/** CNPJ sem máscara e em maiúsculo. Desde jul/2026 as 12 primeiras posições podem ter letras. */
export const normalizeCnpj = (value: string): string => value.replace(/[^a-z0-9]/gi, "").toUpperCase();

/** Formata progressivamente para XX.XXX.XXX/XXXX-00 (numérico ou alfanumérico). */
export const formatCnpj = (value: string): string => {
    const d = normalizeCnpj(value).slice(0, 14);
    return d
        .replace(/^(\w{2})(\w)/, "$1.$2")
        .replace(/^(\w{2})\.(\w{3})(\w)/, "$1.$2.$3")
        .replace(/\.(\w{3})(\w)/, ".$1/$2")
        .replace(/(\w{4})(\w)/, "$1-$2");
};

/** Remove protocolo e barra final para exibição (ex.: "https://site.com/" -> "site.com"). */
export const normalizeWebsite = (value: string): string =>
    value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
