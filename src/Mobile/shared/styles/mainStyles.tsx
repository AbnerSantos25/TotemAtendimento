import { Platform, StyleSheet } from "react-native";

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: '100%',
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  }
});

export const TextStyles = StyleSheet.create({
  welcomeLabel: {
    color: '#CCC',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  userEmail: {
    color: '#AAA',
    fontSize: 14,
  },
});

export const ButtonStyles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "rgba(211, 47, 47, 0.2)",
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

export const FormStyles = StyleSheet.create({
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

