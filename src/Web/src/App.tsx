import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Reports } from "./pages/dashboard/Reports";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Login } from "./pages/auth/Login";
import { useAuth } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import { Toaster } from "sonner";

function DashboardTemporario() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Painel do Totem Atendimento</h1>
      <p className="mt-2 text-gray-600">Seja bem-vindo, {user?.name} ({user?.email})</p>

      <button
        onClick={signOut}
        className="mt-6 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Sair do Sistema
      </button>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/dashboard" element={<DashboardTemporario />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/configuracoes" element={<div>Tela de Configurações Futura</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors={false} theme="system" closeButton invert={false} />
    </AuthProvider>
  );
}