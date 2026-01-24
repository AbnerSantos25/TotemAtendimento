import { Platform, StyleSheet } from "react-native";


export default function MainStyles(){
    return StyleSheet.create({
        container: {
            flex: 1,
        },
    });
}

export const ButtonStyles = StyleSheet.create({
    logoutButton: {
    backgroundColor: "rgba(211, 47, 47, 0.2)", // Vermelho translúcido
    borderWidth: 1,
    borderColor: "#d32f2f",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: "#ff8a80",
    fontWeight: "600",
    fontSize: 14,
  },
  });

export function FormStyles(){
    return StyleSheet.create({
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 20,
    color: '#E0E0E0', 
    marginBottom: 10,
    fontWeight: '400',
  },
  input: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: 12,
    fontSize: 18,
    color: 'white',
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    paddingHorizontal: 15,
    borderWidth: 0, 
  },

  primaryButtonContainer: {
    backgroundColor: '#6a1b9a', 
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
}

