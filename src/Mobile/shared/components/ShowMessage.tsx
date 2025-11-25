import Toast, { ToastOptions } from 'react-native-root-toast';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export const AGMessageType = {
  success: 'success' as MessageType,
  error: 'error' as MessageType,
  info: 'info' as MessageType,
  warning: 'warning' as MessageType,
};

const DEFAULT_OPTIONS: ToastOptions = {
  duration: Toast.durations.LONG,
  position: Toast.positions.TOP,
  shadow: true,
  animation: true,
  hideOnPress: true,
  delay: 0,
};

const getToastStyles = (type: MessageType) => {
  switch (type) {
    case 'success':
      return { backgroundColor: '#4CAF50', textColor: '#FFFFFF' };
    case 'error':
      return { backgroundColor: '#F44336', textColor: '#FFFFFF' };
    case 'warning':
      return { backgroundColor: '#FF9800', textColor: '#333333' };
    case 'info':
    default:
      return { backgroundColor: '#2196F3', textColor: '#FFFFFF' };
  }
};

/**
 * Exibe uma mensagem Toast customizada.
 * @param message - A string de texto a ser exibida.
 * @param type - O tipo de mensagem ('success', 'error', 'info').
 * @param customOptions - Opções opcionais para sobrescrever o padrão.
 */
export function AGShowMessage(
  message: string,
  type: MessageType = AGMessageType.info,
  customOptions?: ToastOptions
) {
  const typeStyles = getToastStyles(type);

  const options: ToastOptions = {
    ...DEFAULT_OPTIONS,
    ...typeStyles,
    ...customOptions,
  };

  Toast.show(message, options);
}

export const showSuccess = (message: string) => AGShowMessage(message, AGMessageType.success);
export const showError = (message: string) => AGShowMessage(message, AGMessageType.error);
export const showInfo = (message: string) => AGShowMessage(message, AGMessageType.info);
