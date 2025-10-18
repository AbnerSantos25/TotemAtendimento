import { Redirect } from 'expo-router';

// O ponto de entrada principal do aplicativo.
// Ele não renderiza UI, apenas redireciona.
export default function AppIndexRedirect() {
  // Redireciona imediatamente o usuário para a rota da tela inicial real.
  // O caminho é relativo à pasta `app/`.
  return <Redirect href="/configuration/configuracoes" />;
}
