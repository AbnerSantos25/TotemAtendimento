import { toast } from "sonner";

// Definimos o que é obrigatório e opcional para as nossas mensagens
export interface MessageOptions {
    title: string;
    description?: string;
}

// O nosso serviço de abstração
export const AGShowMessage = {

    success: ({ title, description }: MessageOptions) => {
        toast.success(title, {
            description: description,
        });
    },

    error: ({ title, description }: MessageOptions) => {
        toast.error(title, {
            description: description,
        });
        // Futuramente, você pode adicionar aqui: logger.SendToBackend(title, description);
    },

    warning: ({ title, description }: MessageOptions) => {
        toast.warning(title, {
            description: description,
        });
    },

    info: ({ title, description }: MessageOptions) => {
        toast.info(title, {
            description: description,
        });
    }
};