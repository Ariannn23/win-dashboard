import {
  AlertTriangle,
  ArrowUpRight,
  Gauge,
  Plus,
  ShoppingCart,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { initials } from '@/shared/lib/format';
import { saleAmount } from '@/shared/lib/sales';
import { PageSkeleton } from '@/shared/ui/Skeleton';
import type { Sale } from '@/types';

function buildStats(sales: Sale[]) {
  return {
    total: sales.length,
    installed: sales.filter((sale) => sale.estado === 'INSTALADO').length,
    pending: sales.filter((sale) => sale.estado === 'PENDIENTE_GRABACION').length,
    canceled: sales.filter((sale) => sale.estado === 'CANCELADO').length,
    rejected: sales.filter((sale) => sale.estado === 'RECHAZADO').length,
  };
}

const chartBars = [
  { label: 'Lun', value: 56, target: 72 },
  { label: 'Mar', value: 63, target: 82 },
  { label: 'Mie', value: 58, target: 68 },
  { label: 'Jue', value: 38, target: 92 },
  { label: 'Vie', value: 61, target: 76 },
  { label: 'Sab', value: 66, target: 104 },
  { label: 'Dom', value: 80, target: 96 },
];

type ObjectiveMode = 'daily' | 'monthly';

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function latestSalesDate(sales: Sale[]) {
  return sales.reduce<Date>((latest, sale) => {
    const created = new Date(sale.created_at);
    return created > latest ? created : latest;
  }, new Date());
}

function buildObjectiveRows(sales: Sale[], mode: ObjectiveMode) {
  if (mode === 'daily') {
    const anchor = latestSalesDate(sales);
    const start = startOfDay(new Date(anchor));
    start.setDate(start.getDate() - 6);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const value = sales.filter((sale) => sameDay(new Date(sale.created_at), date)).length;
      const fallback = chartBars[index];
      const target = Math.max(value + 2, Math.ceil((sales.length || 14) / 6), 4);
      return { label: fallback.label, caption: `${date.getDate()}/${date.getMonth() + 1}`, value, target };
    });
  }

  const year = latestSalesDate(sales).getFullYear();
  return monthLabels.map((label, index) => {
    const value = sales.filter((sale) => {
      const created = new Date(sale.created_at);
      return created.getFullYear() === year && created.getMonth() === index;
    }).length;
    const target = Math.max(value + 4, Math.ceil((sales.length || 24) / 8));
    return { label, caption: String(year), value, target };
  });
}

export function DashboardPage() {
  const { user } = useAuth();
  const { isLoading, profiles, visibleSales } = useCrm();
  const { sidebarCollapsed = false } = useOutletContext<{ sidebarCollapsed?: boolean }>();
  if (!user) return null;
  if (isLoading) return <PageSkeleton cards={4} tableRows={5} tableColumns={4} />;

  const sales = visibleSales(user);
  const stats = buildStats(sales);
  const advisors = profiles.filter((profile) => profile.rol === 'ASESOR' && profile.activo).length;
  const supervisors = profiles.filter((profile) => profile.rol === 'SUPERVISOR' && profile.activo).length;
  const monthlyAmount = sales.reduce((acc, sale) => acc + saleAmount(sale), 0);

  const recentSales = sales.slice(0, 3);
  const metricCards = [
    {
      icon: UsersRound,
      label: 'Clientes activos',
      value: stats.total + advisors + supervisors,
      trend: '+12.5%',
    },
    {
      icon: Gauge,
      label: 'MRR actual',
      value: `S/${monthlyAmount.toLocaleString('es-PE')}`,
      trend: '+8.2%',
    },
    {
      icon: TrendingUp,
      label: 'Capacidad de ventas',
      value: '75%',
      detail: `/${Math.max(stats.total * 2, 12)} objetivos`,
      progress: 75,
    },
    {
      icon: ShoppingCart,
      label: 'Ticket Promedio',
      value: `S/${stats.total ? Math.round(monthlyAmount / stats.total).toLocaleString('es-PE') : 0}`,
      detail: 'por venta',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#1F1F1F]">
            Panel de Control
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm font-semibold leading-6 text-[#6B625C]">
            Visualizacion global del rendimiento comercial. Tienes{' '}
            <span className="font-extrabold text-[#C94A00]">{stats.pending} nuevas activaciones</span>{' '}
            pendientes de gestion.
          </p>
        </div>
      </section>

      <section
        className={
          sidebarCollapsed
            ? 'grid gap-4 xl:grid-cols-[0.95fr_1.05fr]'
            : 'space-y-4'
        }
      >
        <div className={sidebarCollapsed ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'}>
          {metricCards.map((metric) => (
            <DashboardMetric key={metric.label} {...metric} />
          ))}
        </div>

        {sidebarCollapsed ? (
          <SalesObjectiveCard sidebarCollapsed={sidebarCollapsed} sales={sales} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <SalesObjectiveCard sidebarCollapsed={sidebarCollapsed} sales={sales} />
            <OperationalSummaryCard stats={stats} monthlyAmount={monthlyAmount} />
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
            <div className="flex items-center justify-between border-b border-[#EDE4DC] px-6 py-4">
              <h2 className="text-base font-extrabold text-[#1F1F1F]">Actividad Reciente de Clientes</h2>
              <button type="button" className="text-sm font-extrabold text-[#C94A00]">
                Ver todos
              </button>
            </div>
            <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.6fr] bg-[#FFF2E7] px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#4B3024]">
              <span>Cliente</span>
              <span>Servicio</span>
              <span>Estado</span>
              <span className="text-right">Monto</span>
            </div>
            <div className="divide-y divide-[#EDE4DC]">
              {(recentSales.length ? recentSales : sales).slice(0, 3).map((sale, index) => (
                <article
                  key={sale.id}
                  className="grid grid-cols-[1.3fr_1fr_0.8fr_0.6fr] items-center px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FFE2CC] text-xs font-extrabold text-[#C94A00]">
                      {initials(sale.nombres_cliente)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#1F1F1F]">{sale.nombres_cliente}</p>
                      <p className="text-xs font-semibold text-[#6B625C]">#{sale.numero_documento}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#4B3024]">{sale.plan_contratar}</p>
                  <span
                    className={`w-fit rounded-full px-4 py-1.5 text-xs font-extrabold ${
                      sale.estado === 'INSTALADO'
                        ? 'bg-[#DDF8E9] text-[#2FA66A]'
                        : index === 1
                          ? 'bg-[#FFF1C7] text-[#B46A00]'
                          : 'bg-[#FFE2CC] text-[#C94A00]'
                    }`}
                  >
                    {STATUS_LABELS[sale.estado]}
                  </span>
                  <p className="text-right text-base font-extrabold text-[#1F1F1F]">
                    S/{saleAmount(sale).toFixed(2)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <TopPlansCard sales={sales} />
        </div>

        <aside className="space-y-4">
          <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-6 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
            <h2 className="text-base font-extrabold text-[#1F1F1F]">Clientes Recientes</h2>
            <div className="mt-5 space-y-4">
              {(recentSales.length ? recentSales : sales).slice(0, 3).map((sale) => (
                <div key={sale.id} className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FFB48A] text-xs font-extrabold text-[#8C2D00]">
                    {initials(sale.nombres_cliente)}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#1F1F1F]">{sale.nombres_cliente}</p>
                    <p className="text-sm font-semibold text-[#6B625C]">{sale.plan_contratar.split(' ').slice(0, 3).join(' ')}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 h-10 w-full rounded-[13px] border border-[#E8D8CC] text-xs font-extrabold text-[#4B3024]" type="button">
              Ver todos los clientes
            </button>
          </section>

          <GoalCard />
        </aside>
      </section>
    </div>
  );
}

function DashboardMetric({
  icon: Icon,
  label,
  value,
  trend,
  detail,
  progress,
  badge,
}: {
  icon: typeof ShoppingCart;
  label: string;
  value: number | string;
  trend?: string;
  detail?: string;
  progress?: number;
  badge?: string;
}) {
  return (
    <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#FFE2CC] text-[#C94A00]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 rounded-full bg-[#E9FFF2] px-2.5 py-1 text-xs font-extrabold text-[#2FA66A]">
            {trend}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
        {badge && (
          <span className="rounded-full bg-[#FFE8E8] px-2.5 py-1 text-xs font-extrabold text-[#D64545]">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#6B625C]">{label}</p>
      <div className="mt-1.5 flex items-end gap-2">
        <p className="text-[28px] font-extrabold tracking-[-0.03em] text-[#1F1F1F]">{value}</p>
        {detail && <span className="pb-1 text-xs font-bold text-[#6B625C]">{detail}</span>}
      </div>
      {typeof progress === 'number' && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F4E7DE]">
          <div className="h-full rounded-full bg-[#C94A00]" style={{ width: `${progress}%` }} />
        </div>
      )}
    </section>
  );
}

function SalesObjectiveCard({ sidebarCollapsed, sales }: { sidebarCollapsed: boolean; sales: Sale[] }) {
  const [mode, setMode] = useState<ObjectiveMode>('daily');
  const rows = useMemo(() => buildObjectiveRows(sales, mode), [mode, sales]);
  const totalValue = rows.reduce((total, bar) => total + bar.value, 0);
  const totalTarget = rows.reduce((total, bar) => total + bar.target, 0);
  const progress = totalTarget ? Math.round((totalValue / totalTarget) * 100) : 0;
  const remaining = Math.max(0, totalTarget - totalValue);
  const titleDetail = mode === 'daily' ? 'Rendimiento diario por activaciones.' : 'Rendimiento mensual por activaciones.';

  return (
    <section className="flex h-full flex-col rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Ventas vs Objetivos</h2>
          <p className="mt-1 text-sm font-semibold text-[#6B625C]">{titleDetail}</p>
        </div>
        <div className="flex rounded-[15px] bg-[#FFF2E7] p-1">
          {[
            { value: 'daily', label: 'Diario' },
            { value: 'monthly', label: 'Mensual' },
          ].map((option) => (
            <button
              key={option.value}
              className={`rounded-[10px] px-3 py-1.5 text-xs transition ${
                mode === option.value
                  ? 'bg-white font-extrabold text-[#C94A00] shadow-sm'
                  : 'font-bold text-[#6B625C] hover:text-[#C94A00]'
              }`}
              type="button"
              onClick={() => setMode(option.value as ObjectiveMode)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${sidebarCollapsed ? 'mt-6' : 'mt-5'} flex flex-1 flex-col`}>
        <div className={`${sidebarCollapsed ? 'h-[250px]' : 'h-[220px]'} flex items-end justify-between gap-3 rounded-[18px] bg-[#FFFCFA] px-4 pb-3 pt-5`}>
            {rows.map((bar) => {
              const progress = Math.min(100, Math.round((bar.value / bar.target) * 100));
              return (
                <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="relative flex h-full w-full max-w-[54px] items-end overflow-hidden rounded-[14px] bg-[#EFE3DA] shadow-inner">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-[14px] bg-gradient-to-t from-[#D83A00] to-[#FF7A1A] shadow-[0_-8px_18px_rgba(242,74,0,0.16)]"
                      style={{ height: `${progress}%` }}
                    />
                    <span className="absolute inset-x-0 bottom-3 text-center text-[10px] font-extrabold text-white/90 drop-shadow-[0_1px_2px_rgba(91,47,20,0.28)]">
                      {progress}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-extrabold text-[#4B3024]">{bar.label}</span>
                    <span className="block text-[10px] font-bold text-[#8A7F78]">
                      {bar.value}/{bar.target}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <ObjectiveSummaryFooter
          progress={progress}
          remaining={remaining}
          totalTarget={totalTarget}
          totalValue={totalValue}
          periods={rows.length}
        />
      </div>
    </section>
  );
}

function ObjectiveSummaryFooter({
  progress,
  remaining,
  totalTarget,
  totalValue,
  periods,
}: {
  progress: number;
  remaining: number;
  totalTarget: number;
  totalValue: number;
  periods: number;
}) {
  return (
    <div className="mt-4 grid gap-3 rounded-[18px] border border-[#F1DAC8] bg-[#FFF8F3] p-3 lg:grid-cols-[180px_1fr_180px] lg:items-center">
      <div className="rounded-[14px] bg-white px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8A7F78]">Resumen</p>
        <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#1F1F1F]">{totalValue}</p>
        <p className="text-xs font-bold text-[#6B625C]">ventas de {totalTarget} objetivo</p>
      </div>

      <div className="rounded-[14px] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold leading-5 text-[#6B625C]">
            El fondo claro marca el 100% disponible y el naranja muestra el avance real.
          </p>
          <span className="shrink-0 text-lg font-extrabold text-[#C94A00]">{progress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F3EAE3]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#D83A00] to-[#FF7A1A]" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-[14px] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#4B3024]">
          {periods}
          <small className="mt-0.5 block text-[11px] text-[#6B625C]">periodos</small>
        </span>
        <span className="rounded-[14px] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#C94A00]">
          {remaining}
          <small className="mt-0.5 block text-[11px] text-[#C94A00]">faltan</small>
        </span>
      </div>
    </div>
  );
}

function GoalCard() {
  return (
    <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#F24A00] via-[#E04400] to-[#A83B00] p-6 text-white shadow-[0_16px_32px_rgba(201,74,0,0.24)]">
      <svg className="absolute -right-8 -top-8 h-36 w-36 text-white/15" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="14" />
        <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="10" />
        <path d="M60 17v20M60 83v20M17 60h20M83 60h20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/75">Meta trimestral</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">1.5K ventas</h2>
          </div>
          <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-extrabold ring-1 ring-[#FFB48A]/60 shadow-[0_0_15px_rgba(255,180,138,0.35)]">84%</span>
        </div>
        <p className="mt-4 max-w-xs text-sm font-semibold leading-6 text-white/88">
          Faltan 240 ventas para cerrar la meta. Mantener el ritmo actual deja el objetivo al alcance.
        </p>
        <div className="mt-6 rounded-[16px] bg-white/14 p-3 ring-1 ring-[#FFB48A]/60 shadow-[0_0_15px_rgba(255,180,138,0.35)]">
          <div className="flex items-center justify-between text-xs font-extrabold text-white/90">
            <span>1,260 logradas</span>
            <span>1,500 objetivo</span>
          </div>
          <div className="mt-3 relative h-3 rounded-full bg-[#8A2D00]/45">
            <div className="absolute left-0 top-0 h-full rounded-full bg-white" style={{ width: '84%' }}>
              <span className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full border-[3px] border-white bg-[#FF7A1A] shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopPlansCard({ sales }: { sales: Sale[] }) {
  const planStats = Object.entries(
    sales.reduce((acc, sale) => {
      const plan = sale.plan_contratar;
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const total = sales.length || 1;

  return (
    <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-6 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
      <h2 className="text-base font-extrabold text-[#1F1F1F]">Planes mas vendidos</h2>
      <div className="mt-5 space-y-4">
        {planStats.length > 0 ? (
          planStats.map(([plan, count]) => {
            const percent = Math.round((count / total) * 100);
            return (
              <div key={plan}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold text-[#4B3024]">{plan}</span>
                  <span className="font-semibold text-[#6B625C]">{count} ventas ({percent}%)</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F3EAE3]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#F24A00] to-[#C94A00]" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm font-semibold text-[#8A7F78]">No hay ventas registradas aun.</p>
        )}
      </div>
    </section>
  );
}

function OperationalSummaryCard({
  stats,
  monthlyAmount,
}: {
  stats: ReturnType<typeof buildStats>;
  monthlyAmount: number;
}) {
  return (
    <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#1F1F1F]">Resumen operativo</h2>
          <p className="mt-1 text-sm font-semibold text-[#6B625C]">Estado comercial del dia.</p>
        </div>
        <span className="rounded-full bg-[#FFE2CC] px-3 py-1 text-xs font-extrabold text-[#C94A00]">
          Hoy
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <SummaryRow label="Instaladas" value={stats.installed} tone="success" />
        <SummaryRow label="Pendientes" value={stats.pending} tone="warning" />
        <SummaryRow label="Rechazadas" value={stats.rejected} tone="danger" />
        <SummaryRow label="Canceladas" value={stats.canceled} tone="muted" />
      </div>

      <div className="mt-5 rounded-[16px] bg-[#FFF2E7] p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6B625C]">MRR proyectado</p>
        <p className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#1F1F1F]">
          S/{monthlyAmount.toLocaleString('es-PE')}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#F24A00] to-[#C94A00]" />
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'danger' | 'muted';
}) {
  const colors = {
    success: 'bg-[#DDF8E9] text-[#2FA66A]',
    warning: 'bg-[#FFF1C7] text-[#B46A00]',
    danger: 'bg-[#FFE8E8] text-[#D64545]',
    muted: 'bg-[#F3EAE3] text-[#6B625C]',
  };

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#F1DAC8] px-4 py-3">
      <span className="text-sm font-bold text-[#6B625C]">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${colors[tone]}`}>{value}</span>
    </div>
  );
}
