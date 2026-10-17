import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import labels from '../../locales/pt-BR/labels.json';
import messages from '../../locales/pt-BR/messages.json';
import errors from '../../locales/pt-BR/errors.json';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

const resources = {
    'pt-BR': {
        labels,
        messages,
        errors,
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'pt-BR', 
        fallbackLng: 'pt-BR',
        ns: ['labels', 'messages', 'errors'],
        defaultNS: 'labels',
        interpolation: {
            escapeValue: false, 
        }
    });

export default i18n;

/** `options` preenche os placeholders do texto, ex.: "A fila {{name}} foi ativada." */
export const GetLocalized = (key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options);
};
