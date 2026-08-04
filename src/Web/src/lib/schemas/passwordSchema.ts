import { z } from "zod";

/**
 * Schema de validação de senha que espelha as regras padrão do ASP.NET Identity.
 * Use este schema em todos os formulários de cadastro e alteração de senha.
 *
 * Regras:
 * - Mínimo de 6 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial (!@#$%^&* etc.)
 */
export const passwordSchema = z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
    .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial (ex: !@#$%).");
