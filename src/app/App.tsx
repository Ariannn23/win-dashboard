import { Navigate, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/shared/layout/AppLayout';
import { useAuth } from '@/app/providers/AuthProvider';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { PlansPage } from '@/pages/PlansPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SalesPage } from '@/pages/SalesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UsersPage } from '@/pages/UsersPage';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F3]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#C94A00]" />
        <p className="text-sm font-semibold text-[#8A7F78]">Cargando...</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ element, blockedRoles }: { element: React.ReactNode; blockedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && blockedRoles?.includes(user.rol)) {
      const timer = setTimeout(() => {
        navigate(user.rol === 'ASESOR' || user.rol === 'BACK' ? '/ventas' : '/dashboard', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, blockedRoles, navigate]);

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (blockedRoles && blockedRoles.includes(user.rol)) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-[#4B3024]">Acceso Denegado</h2>
        <p className="mt-2 text-[#8A7F78]">No tienes permisos para ver esta página.</p>
        <p className="mt-6 text-sm font-semibold text-[#C94A00] animate-pulse">
          Serás redirigido en unos segundos...
        </p>
      </div>
    );
  }
  return <>{element}</>;
}

function IndexRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (user?.rol === 'ASESOR' || user?.rol === 'BACK') return <Navigate to="/ventas" replace />;
  return <Navigate to="/dashboard" replace />;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <IndexRoute /> },
      { path: 'dashboard', element: <RoleRoute element={<DashboardPage />} blockedRoles={['ASESOR', 'BACK']} /> },
      { path: 'clientes', element: <RoleRoute element={<ClientsPage />} blockedRoles={['ASESOR', 'BACK']} /> },
      { path: 'ventas', element: <SalesPage /> },
      { path: 'planes', element: <RoleRoute element={<PlansPage />} blockedRoles={['ASESOR', 'BACK']} /> },
      { path: 'reportes', element: <RoleRoute element={<ReportsPage />} blockedRoles={['ASESOR', 'BACK']} /> },
      { path: 'historial', element: <RoleRoute element={<HistoryPage />} blockedRoles={['ASESOR', 'SUPERVISOR', 'BACK']} /> },
      { path: 'usuarios', element: <RoleRoute element={<UsersPage />} blockedRoles={['ASESOR', 'BACK']} /> },
      { path: 'configuracion', element: <RoleRoute element={<SettingsPage />} blockedRoles={['ASESOR', 'SUPERVISOR', 'BACK']} /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
