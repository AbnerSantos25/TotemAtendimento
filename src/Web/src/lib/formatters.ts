export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/** Formata progressivamente para 00.000.000/0000-00. */
export const formatCnpj = (value: string): string => {
    const d = onlyDigits(value).slice(0, 14);
    return d
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
};

/** Remove protocolo e barra final para exibição (ex.: "https://site.com/" -> "site.com"). */
export const normalizeWebsite = (value: string): string =>
    value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
