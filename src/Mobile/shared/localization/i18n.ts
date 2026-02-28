import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as labels from '../../locales/pt-BR/labels.json';
import * as messages from '../../locales/pt-BR/messages.json';
import * as errors from '../../locales/pt-BR/errors.json';

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
        },
        compatibilityJSON: 'v4' 
    });

export default i18n;

export const GetLocalized = (key: string) => {
    return i18n.t(key);
};
