import { AlertTriangle, Ban, CheckCircle2, Clock3, Filter, Plus, RotateCcw, Search, TimerReset } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { HistoryPanel } from '@/features/history/components/HistoryPanel';
import { SaleDetailPanel } from '@/features/sales/components/SaleDetailPanel';
import { SaleFormModal } from '@/features/sales/components/SaleFormModal';
import { SalesTable } from '@/features/sales/components/SalesTable';
import { StatusChangeModal } from '@/features/sales/components/StatusChangeModal';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { ComboBox, type SelectOption } from '@/shared/ui/FormControls';
import { PageSkeleton } from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';
import { canCreateSales } from '@/shared/lib/permissions';
import type { Sale, SaleStatus } from '@/types';

export function SalesPage() {
  const { user } = useAuth();
  const { isLoading, profiles, visibleSales, upsertSale, changeSaleStatus, history } = useCrm();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SaleStatus | 'TODOS'>('TODOS');
  const [supervisor, setSupervisor] = useState('TODOS');
  const [advisor, setAdvisor] = useState('TODOS');
  const [editing, setEditing] = useState<Sale | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [statusSale, setStatusSale] = useState<Sale | null>(null);
  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [historySale, setHistorySale] = useState<Sale | null>(null);

  if (!user) return null;
  if (isLoading) return <PageSkeleton cards={5} tableRows={7} tableColumns={8} />;

  const baseSales = visibleSales(user);
  const filteredSales = useMemo(() => {
    const text = query.trim().toLowerCase();
    return baseSales.filter((sale) => {
      const matchesText =
        !text ||
        sale.numero_documento.includes(text) ||
        sale.nombres_cliente.toLowerCase().includes(text);
      const matchesStatus = status === 'TODOS' || sale.estado === status;
      const matchesSupervisor = supervisor === 'TODOS' || sale.supervisor_id === supervisor;
      const matchesAdvisor = advisor === 'TODOS' || sale.asesor_id === advisor;
      return matchesText && matchesStatus && matchesSupervisor && matchesAdvisor;
    });
  }, [advisor, baseSales, query, status, supervisor]);

  const completed = baseSales.filter((sale) => sale.estado === 'INSTALADO').length;
  const pending = baseSales.filter((sale) => sale.estado === 'PENDIENTE_GRABACION').length;
  const overdue = baseSales.filter((sale) => sale.estado === 'RECHAZADO').length;
  const canceled = baseSales.filter((sale) => sale.estado === 'CANCELADO').length;
  const inProcess = baseSales.filter((sale) =>
    ['PROGRAMADO_GRABACION', 'GRABADO', 'PROGRAMADO_INSTALACION'].includes(sale.estado),
  ).length;

  function clearFilters() {
    setQuery('');
    setStatus('TODOS');
    setSupervisor('TODOS');
    setAdvisor('TODOS');
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Ventas</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Gestiona todas las ventas de servicios de internet.
          </p>
        </div>
        {canCreateSales(user) && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar venta
          </button>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SalesMetric icon={CheckCircle2} label="Completadas" value={completed} tone="success" />
        <SalesMetric icon={RotateCcw} label="En Proceso" value={inProcess} tone="info" />
        <SalesMetric icon={Clock3} label="Pendientes" value={pending} tone="warning" />
        <SalesMetric icon={AlertTriangle} label="Vencidas" value={overdue} tone="danger" />
        <SalesMetric icon={Ban} label="Canceladas" value={canceled} tone="muted" />
      </section>

      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-6 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1fr_1fr]">
          <FilterField label="Buscar venta o cliente">
            <Search className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-[#4B3024]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ID o nombre..."
              className="h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] pl-11 pr-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </FilterField>

          <FilterField label="Estado">
            <FilterSelect
              value={status}
              onChange={(value) => setStatus(value as SaleStatus | 'TODOS')}
              options={[
                { value: 'TODOS', label: 'Todos' },
                ...(Object.keys(STATUS_LABELS) as SaleStatus[]).map((item) => ({ value: item, label: STATUS_LABELS[item] })),
              ]}
            />
          </FilterField>

          <FilterField label="Supervisor">
            <FilterSelect
              value={supervisor}
              onChange={setSupervisor}
              options={[
                { value: 'TODOS', label: 'Todos' },
                ...profiles.filter((profile) => profile.rol === 'SUPERVISOR').map((profile) => ({ value: profile.id, label: profile.nombres })),
              ]}
            />
          </FilterField>

          <FilterField label="Asesor">
            <FilterSelect
              value={advisor}
              onChange={setAdvisor}
              options={[
                { value: 'TODOS', label: 'Todos' },
                ...profiles.filter((profile) => profile.rol === 'ASESOR').map((profile) => ({ value: profile.id, label: profile.nombres })),
              ]}
            />
          </FilterField>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#EDE4DC] pt-5">
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-[13px] bg-[#A83B00] px-5 text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(168,59,0,0.18)]"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filtrar
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-11 items-center gap-2 rounded-[13px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] hover:bg-[#FFF2E7]"
          >
            <TimerReset className="h-4 w-4" aria-hidden="true" />
            Limpiar filtros
          </button>
        </div>
      </section>

      <SalesTable
        sales={filteredSales}
        profiles={profiles}
        user={user}
        onEdit={(sale) => {
          setEditing(sale);
          setShowForm(true);
        }}
        onStatus={setStatusSale}
        onView={setDetailSale}
        onHistory={setHistorySale}
      />

      {showForm && (
        <SaleFormModal
          sale={editing}
          profiles={profiles}
          currentUser={user}
          onClose={() => setShowForm(false)}
          onSubmit={(values) => {
            upsertSale({
              ...values,
              id: editing?.id,
              estado: editing?.estado,
              creado_por: editing?.creado_por ?? user.id,
            });
            showToast({
              title: editing ? 'Venta actualizada' : 'Venta registrada',
              detail: editing ? 'Los cambios se guardaron correctamente.' : 'La venta quedo pendiente de grabacion.',
              tone: 'success',
            });
            setShowForm(false);
          }}
        />
      )}

      {statusSale && (
        <StatusChangeModal
          sale={statusSale}
          onClose={() => setStatusSale(null)}
          onSubmit={(nextStatus, comment) => {
            changeSaleStatus(statusSale.id, nextStatus, user, comment);
            showToast({
              title: 'Estado actualizado',
              detail: 'El movimiento quedo registrado en el historial.',
              tone: 'success',
            });
            setStatusSale(null);
          }}
        />
      )}

      {historySale && (
        <HistoryPanel
          sale={historySale}
          history={history.filter((item) => item.venta_id === historySale.id)}
          onClose={() => setHistorySale(null)}
        />
      )}

      {detailSale && (
        <SaleDetailPanel
          sale={detailSale}
          profiles={profiles}
          onClose={() => setDetailSale(null)}
        />
      )}
    </div>
  );
}

function SalesMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'muted';
}) {
  const colors = {
    success: 'bg-[#E9FFF2] text-[#009A4E]',
    info: 'bg-[#EAF3FF] text-[#005DE8]',
    warning: 'bg-[#FFF2E7] text-[#D63B00]',
    danger: 'bg-[#FFE8E8] text-[#D64545]',
    muted: 'bg-[#F3EAE3] text-[#6B625C]',
  };

  return (
    <section className="flex h-[84px] items-center gap-4 rounded-[18px] border border-[#EDE4DC] bg-white px-5 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
      <div className={`grid h-11 w-11 place-items-center rounded-[13px] ${colors[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#8A7F78]">{label}</p>
        <p className="mt-0.5 text-base font-extrabold text-[#1F1F1F]">{value}</p>
      </div>
    </section>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="relative block">
      <span className="mb-3 block text-sm font-semibold text-[#4B3024]">{label}</span>
      {children}
    </label>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return <ComboBox value={value} onChange={onChange} options={options} />;
}
