import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Reports } from "./pages/dashboard/Reports";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Login } from "./pages/auth/Login";
import { Layout } from "./components/Layout";
import { Toaster } from "sonner";
import { Configuration } from "./pages/configuration/configuration";
import { QueueConfiguration } from "./pages/configuration/QueueConfiguration";
import { ServiceLocationConfiguration } from "@/pages/configuration/ServiceLocationConfiguration"; // Added this import

function DashboardTemporario() {

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold">Painel do Totem Atendimento</h1>
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
              <Route path="/home" element={<DashboardTemporario />} />
              <Route path="/relatorios" element={<Reports />} />

              <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
                <Route path="/configurations" element={<Configuration />} />
                <Route path="/gestao/filas" element={<QueueConfiguration />} />
                <Route path="/gestao/locais" element={<ServiceLocationConfiguration />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />

        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors={false} theme="system" closeButton invert={false} />
    </AuthProvider>
  );
}