import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tipagem segura para aceitar qualquer nome de ícone do Ionicons
type IoniconName = keyof typeof Ionicons.glyphMap;

interface SelectableOptionProps {
  label: string;
  icon: IoniconName;
  isSelected: boolean;
  onPress: () => void;
}

export function SelectableOption({ label, icon, isSelected, onPress }: SelectableOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isSelected && styles.selected
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons
          name={icon}
          size={22}
          color={isSelected ? "#FFF" : "#A0A0A0"}
        />
        <Text style={[
          styles.text,
          isSelected && styles.textSelected
        ]}>
          {label}
        </Text>
      </View>

      {isSelected && (
        <Ionicons name="checkmark-circle" size={22} color="#6830c0" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressed: {
    backgroundColor: '#333',
  },
  selected: {
    backgroundColor: '#252525',
    borderColor: '#6830c0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: '500',
  },
  textSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});