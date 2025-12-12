import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Pressable, 
  StyleSheet 
} from 'react-native';
import { SelectableOption } from '../../../shared/components/SelectableOption';
import { AGModal } from '../../../shared/components/AGModel';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTheme: (theme: ThemeType) => void;
  currentTheme: ThemeType;
}

export function ThemeModal({ visible, onClose, onSelectTheme, currentTheme }: ThemeModalProps) {
  return (
    <AGModal visible={visible}
        onClose={onClose}
        title="Escolha o Tema"
        subtitle="Defina a aparência do aplicativo">

        {/* Lista de Opções usando o Componente Reutilizável */}
        <View style={styles.optionsContainer}>
        <SelectableOption
            label="Claro"
            icon="sunny-outline"
            isSelected={currentTheme === 'light'}
            onPress={() => onSelectTheme('light')}
        />
        
        <SelectableOption
            label="Escuro"
            icon="moon-outline"
            isSelected={currentTheme === 'dark'}
            onPress={() => onSelectTheme('dark')}
        />
        
        <SelectableOption
            label="Sistema"
            icon="phone-portrait-outline"
            isSelected={currentTheme === 'system'}
            onPress={() => onSelectTheme('system')}
        />
        </View>
    </AGModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fundo escurecido
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
    // Sombras (iOS e Android)
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
  optionsContainer: {
    gap: 12, // Espaçamento entre os botões
    marginBottom: 24,
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