import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  button1Text: string;
  button2Text: string;
  onButton1Press: () => void;
  onButton2Press: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  description,
  button1Text,
  button2Text,
  onButton1Press,
  onButton2Press,
  onClose
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.buttonsContainer}>
            <Pressable style={styles.button} onPress={onButton1Press}>
              <LinearGradient
                colors={['rgba(74,73,76,.8)', 'rgba(74,73,76,.8)']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{button1Text}</Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable style={styles.button} onPress={onButton2Press}>
              <LinearGradient
                colors={['#6830c0', '#f75f6c']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{button2Text}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#444',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  buttonGradient: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});