import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutGrid,
  LogOut,
  Settings,
  ShoppingCart,
  UserRound,
  Users,
  Wifi,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_LABELS } from '@/shared/lib/constants';
import { initials } from '@/shared/lib/format';
import { canManageUsers } from '@/shared/lib/permissions';
import logoWin from '@/assets/icono.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { to: '/planes', label: 'Planes', icon: Wifi },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/historial', label: 'Auditoria', icon: History },
  { to: '/configuracion', label: 'Configuracion', icon: Settings },
];

const previewItems: Array<{ label: string; icon: typeof Settings }> = [];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isAsesor = user.rol === 'ASESOR';
  const isAdmin = user.rol === 'ADMIN';
  const isSupervisor = user.rol === 'SUPERVISOR';
  
  const getNavItems = () => {
    if (isAsesor || user.rol === 'BACK') {
      return [{ to: '/ventas', label: 'Ventas', icon: ShoppingCart }];
    }
    
    if (isSupervisor) {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { to: '/clientes', label: 'Clientes', icon: Users },
        { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
        { to: '/planes', label: 'Planes', icon: Wifi },
        { to: '/reportes', label: 'Reportes', icon: BarChart3 },
        { to: '/usuarios', label: 'Usuarios', icon: UserRound }
      ];
    }
    
    let baseItems = navItems;
    if (!isAdmin) {
      // Hide Planes for non-admins
      baseItems = baseItems.filter(item => item.to !== '/planes');
    }
    
    if (isAdmin) {
      return [...baseItems, { to: '/usuarios', label: 'Usuarios', icon: UserRound }];
    }
    
    return baseItems;
  };

  const items = getNavItems();

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#1F1F1F]">
      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-[#EDE4DC] bg-white transition-[width] duration-300 lg:flex ${
          collapsed ? 'w-[84px]' : 'w-[260px]'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='220' height='220' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C94A00' stroke-width='1.4'%3E%3Cpath d='M30 58h54c21 0 23 32 44 32h62'/%3E%3Cpath d='M28 148h44c18 0 24-42 50-42h70'/%3E%3Ccircle cx='30' cy='58' r='5' fill='%23C94A00'/%3E%3Ccircle cx='84' cy='58' r='4'/%3E%3Ccircle cx='128' cy='90' r='5' fill='%23C94A00'/%3E%3Ccircle cx='190' cy='90' r='4'/%3E%3Ccircle cx='72' cy='148' r='4'/%3E%3Ccircle cx='122' cy='106' r='5'/%3E%3Cpath d='M84 174c16-20 36-20 52 0'/%3E%3Cpath d='M96 188c9-10 19-10 28 0'/%3E%3Cpath d='M108 202h4' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundPosition: 'left 92px top 92px',
            backgroundRepeat: 'repeat',
          }}
        />
        <div className={`relative flex h-[72px] items-center gap-3 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
          <div className="h-10 w-10 shrink-0">
            <img src={logoWin} alt="Win Logo" className="h-full w-full object-contain" />
          </div>
          <div className={collapsed ? 'hidden' : 'block'}>
            <p className="text-[20px] font-extrabold tracking-[-0.03em] text-[#C94A00]">WIN</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B39B8E] mt-[-2px]">Sales CRM</p>
          </div>
          <button
            type="button"
            title={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
            onClick={() => setCollapsed((value) => !value)}
            className={`absolute -right-3 top-6 z-10 grid h-7 w-7 place-items-center rounded-full border border-[#E8D8CC] bg-white text-[#C94A00] shadow-[0_8px_18px_rgba(91,47,20,0.12)] hover:bg-[#FFF2E7] ${
              collapsed ? 'right-[-14px]' : ''
            }`}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className={`hidden-scrollbar relative flex-1 space-y-1.5 overflow-y-auto py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex h-12 items-center gap-3 rounded-[15px] text-sm font-extrabold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F24A00] to-[#C94A00] text-white shadow-[0_16px_28px_rgba(201,74,0,0.24)]'
                    : 'text-[#6B625C] hover:bg-[#FFF2E7] hover:text-[#C94A00]'
                } ${collapsed ? 'justify-center px-0' : 'px-4'}`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className={collapsed ? 'hidden' : 'block'}>{label}</span>
            </NavLink>
          ))}

          <div className="my-2 h-px bg-[#EDE4DC]" />

          {previewItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              title={label}
              className={`flex h-10 w-full items-center gap-3 rounded-[13px] text-left text-sm font-bold text-[#6B625C] transition hover:bg-[#FFF2E7] hover:text-[#C94A00] ${
                collapsed ? 'justify-center px-0' : 'px-4'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className={collapsed ? 'hidden' : 'block'}>{label}</span>
            </button>
          ))}
        </nav>

        <div className={`relative border-t border-[#EDE4DC] p-4 ${collapsed ? 'px-3' : ''}`}>
          <button
            type="button"
            onClick={logout}
            className={`flex h-12 w-full items-center justify-center gap-3 rounded-[15px] border border-[#E8D8CC] text-sm font-extrabold text-[#C94A00] transition hover:bg-[#FFF2E7] ${
              collapsed ? 'px-0' : 'px-4'
            }`}
            title="Cerrar sesión"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className={collapsed ? 'hidden' : 'block'}>Cerrar Sesión</span>
          </button>
          <div className={`mt-4 text-center transition-opacity duration-300 ${collapsed ? 'hidden' : 'block'}`}>
            <p className="text-[11px] font-normal text-[#BDB5AC]">
              © 2026 Desarrollado por SharkCorp
            </p>
          </div>
        </div>
      </aside>

      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[260px]'} print:pl-0 print:m-0 pb-20 lg:pb-0`}>
        <header className="print:hidden sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#EDE4DC] bg-white/90 px-5 backdrop-blur lg:px-7">
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#1F1F1F]">
              Hola, <span className="text-[#C94A00]">{user.nombres.split(' ')[0]}</span> 👋
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-extrabold text-[#1F1F1F]">{user.nombres}</p>
              <p className="text-xs font-extrabold uppercase text-[#C94A00]">{ROLE_LABELS[user.rol]}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FFE2CC] text-xs font-extrabold text-[#C94A00] ring-2 ring-white">
              {initials(user.nombres)}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-6 lg:px-7">
          <Outlet context={{ sidebarCollapsed: collapsed }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-center overflow-x-auto bg-white shadow-[0_-4px_24px_rgba(31,31,31,0.08)] lg:hidden print:hidden border-t border-[#EDE4DC] hide-scrollbar pb-safe">
        <div className="flex h-full w-full min-w-max items-center justify-around px-2">
          {items.filter(item => ['/dashboard', '/clientes', '/ventas', '/planes'].includes(item.to)).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex h-full min-w-[72px] flex-col items-center justify-center gap-1.5 px-2 transition-colors ${
                    isActive ? 'text-[#C94A00]' : 'text-[#6B625C] hover:text-[#4B3024]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center justify-center rounded-full p-1 transition-colors ${isActive ? 'bg-[#FFF2E7]' : ''}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
