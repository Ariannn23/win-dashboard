import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
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

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ element, blockedRoles }: { element: React.ReactNode; blockedRoles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (blockedRoles && blockedRoles.includes(user.rol)) {
    return <Navigate to="/ventas" replace />;
  }
  return <>{element}</>;
}

function IndexRoute() {
  const { user } = useAuth();
  if (user?.rol === 'ASESOR') return <Navigate to="/ventas" replace />;
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
      { path: 'dashboard', element: <RoleRoute element={<DashboardPage />} blockedRoles={['ASESOR']} /> },
      { path: 'clientes', element: <RoleRoute element={<ClientsPage />} blockedRoles={['ASESOR']} /> },
      { path: 'ventas', element: <SalesPage /> },
      { path: 'planes', element: <RoleRoute element={<PlansPage />} blockedRoles={['ASESOR', 'SUPERVISOR', 'BACK']} /> },
      { path: 'reportes', element: <RoleRoute element={<ReportsPage />} blockedRoles={['ASESOR']} /> },
      { path: 'historial', element: <RoleRoute element={<HistoryPage />} blockedRoles={['ASESOR']} /> },
      { path: 'usuarios', element: <RoleRoute element={<UsersPage />} blockedRoles={['ASESOR', 'BACK']} /> },
      { path: 'configuracion', element: <RoleRoute element={<SettingsPage />} blockedRoles={['ASESOR']} /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
