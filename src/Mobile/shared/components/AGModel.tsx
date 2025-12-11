import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet
} from 'react-native';

interface AGModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  cancelText?: string;
}

export function AGModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  cancelText = "Cancelar"
}: AGModalProps) {

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {subtitle && <Text style={styles.dialogSubtitle}>{subtitle}</Text>}

          <View style={styles.contentContainer}>
            {children}
          </View>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{cancelText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    // Sombras
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  dialogSubtitle: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 24,
    textAlign: 'center',
  },
  contentContainer: {
    marginBottom: 24,
    gap: 12, // Espaçamento padrão entre itens filhos
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#f75f6c', // Vermelho/Rosa do gradiente
    fontSize: 16,
    fontWeight: '600',
  },
});