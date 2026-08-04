import { toast } from "sonner";

export interface MessageOptions {
    title: string;
    description?: string;
    duration?: number;
}

export const AGShowMessage = {

    success: ({ title, description, duration }: MessageOptions) => {
        toast.success(title, {
            description: description,
            duration: duration
        });
    },

    error: ({ title, description, duration }: MessageOptions) => {
        toast.error(title, {
            description: description,
            duration: duration
        });
    },

    warning: ({ title, description, duration }: MessageOptions) => {
        toast.warning(title, {
            description: description,
            duration: duration
        });
    },

    info: ({ title, description, duration }: MessageOptions) => {
        toast.info(title, {
            description: description,
            duration: duration
        });
    }
};