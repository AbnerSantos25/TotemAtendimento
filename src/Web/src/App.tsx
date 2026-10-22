import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationSettingsProvider } from "./contexts/OrganizationSettingsContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Login } from "./pages/auth/Login";
import { Layout } from "./components/Layout";
import { PageLoader } from "./components/PageLoader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import { Role } from "./models/UserModels";
import { lazyNamed } from "@/lib/lazyNamed";

import { GetLocalized } from "@/shared/localization/i18n";
import { Labels } from "@/shared/localization/keys";

// Login fica no bundle inicial; as demais páginas são baixadas sob demanda
const Configuration = lazyNamed(() => import("./pages/configuration/configuration"), "Configuration");
const QueueConfiguration = lazyNamed(() => import("./pages/configuration/QueueConfiguration"), "QueueConfiguration");
const ServiceLocationConfiguration = lazyNamed(() => import("@/pages/configuration/ServiceLocationConfiguration"), "ServiceLocationConfiguration");
const UserConfiguration = lazyNamed(() => import("@/pages/configuration/UserConfiguration"), "UserConfiguration");
const ServiceTypeConfiguration = lazyNamed(() => import("@/pages/configuration/ServiceTypeConfiguration"), "ServiceTypeConfiguration");
const MyAccount = lazyNamed(() => import("./pages/user/MyAccount"), "MyAccount");
const MeuGuiche = lazyNamed(() => import("./pages/attendance/MeuGuiche"), "MeuGuiche");
const AttendanceDisplay = lazyNamed(() => import("./pages/attendance/AttendanceDisplay"), "AttendanceDisplay");

function DashboardTemporario() {

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold">{GetLocalized(Labels.DashboardTitle)}</h1>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <OrganizationSettingsProvider>
      <BrowserRouter>
        {/* Suspense externo: rotas fora do Layout. O interno, dentro do Layout, evita o menu piscar ao navegar */}
        <Suspense fallback={<PageLoader fullScreen />}>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout><Suspense fallback={<PageLoader />}><Outlet /></Suspense></Layout>}>
              <Route path="/home" element={<DashboardTemporario />} />
              <Route path="/minha-conta" element={<MyAccount />} />
              <Route path="/meu-guiche" element={<MeuGuiche />} />

              <Route element={<PrivateRoute allowedRoles={[Role.Admin]} />}>
                <Route path="/configurations" element={<Configuration />} />
                <Route path="/gestao/filas" element={<QueueConfiguration />} />
                <Route path="/gestao/locais" element={<ServiceLocationConfiguration />} />
                <Route path="/gestao/usuarios" element={<UserConfiguration />} />
                <Route path="/gestao/servicos" element={<ServiceTypeConfiguration />} />
              </Route>
            </Route>
          </Route>

          <Route element={<PrivateRoute allowedRoles={[Role.System]} />}>
            {/* Painel fica numa TV sem ninguém olhando: em caso de erro, recarrega sozinho */}
            <Route path="/painel-senhas" element={<ErrorBoundary autoReloadMs={30_000}><AttendanceDisplay /></ErrorBoundary>} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />

        </Routes>
        </Suspense>
      </BrowserRouter>
      </OrganizationSettingsProvider>
      <Toaster position="bottom-right" richColors={false} theme="system" closeButton invert={false} />
    </AuthProvider>
  );
}