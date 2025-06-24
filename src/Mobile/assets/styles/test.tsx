import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  meuEstilo: {
    backgroundColor: "blue",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  link: {
    color: "blue",
    fontSize: 18,
    marginVertical: 10,
    textDecorationLine: "underline",
  },
});

export default styles;
