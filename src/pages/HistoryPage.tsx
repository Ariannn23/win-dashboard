import { Calendar, ChevronLeft, ChevronRight, Download, Eye, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { ROLE_LABELS, STATUS_LABELS } from '@/shared/lib/constants';
import { formatDateOnly, formatTimeOnly, initials } from '@/shared/lib/format';
import { canViewSale } from '@/shared/lib/permissions';
import { ComboBox, DateControl, type SelectOption } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { PageSkeleton } from '@/shared/ui/Skeleton';
import type { Profile, Role, Sale, SaleStatus, StatusHistory } from '@/types';

type HistoryModule = 'TODOS' | 'VENTAS' | 'USUARIOS' | 'PLANES' | 'COBROS' | 'CLIENTES';
type ActionLabel = 'CAMBIO';

const MODULE_LABELS: Record<HistoryModule, string> = {
  TODOS: 'Todos los modulos',
  VENTAS: 'Ventas',
  USUARIOS: 'Usuarios',
  PLANES: 'Planes',
  COBROS: 'Cobros',
  CLIENTES: 'Clientes',
};

function actionTone(_action: ActionLabel) {
  return 'bg-[#FFE2CC] text-[#A83B00]';
}

function statusTone(status: SaleStatus) {
  if (status === 'INSTALADO') return 'bg-[#DDF8E9] text-[#2FA66A]';
  if (status === 'RECHAZADO') return 'bg-[#FFE8E8] text-[#D64545]';
  if (status === 'CANCELADO') return 'bg-[#F3EAE3] text-[#6B625C]';
  return 'bg-[#FFE2CC] text-[#A83B00]';
}

function roleBadge(rol: Role) {
  if (rol === 'ADMIN') return 'bg-[#FFE2CC] text-[#A83B00]';
  if (rol === 'SUPERVISOR') return 'bg-[#EAF3FF] text-[#005DE8]';
  if (rol === 'BACK') return 'bg-[#F3EAE3] text-[#6B625C]';
  return 'bg-[#DDF8E9] text-[#2FA66A]';
}

function roleFromUserId(_userId: string, profiles: Profile[]): Role {
  return profiles.find((profile) => profile.id === _userId)?.rol ?? 'ASESOR';
}

function moduleFromSale(_sale: unknown, _status: SaleStatus): HistoryModule {
  return 'VENTAS';
}

function ipFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const a = 100 + (hash % 150);
  const b = hash % 250;
  return `192.168.${a}.${b}`;
}

function describeChange(item: StatusHistory, sale: { plan_contratar: string; nombres_cliente: string } | undefined) {
  if (sale) {
    return `Actualizacion de estado: ${STATUS_LABELS[item.estado_anterior]} a ${STATUS_LABELS[item.estado_nuevo]} - ${sale.nombres_cliente}`;
  }
  return item.comentario || `Cambio de estado a ${STATUS_LABELS[item.estado_nuevo]}`;
}

export function HistoryPage() {
  const { user } = useAuth();
  const { isLoading, history, sales, profiles } = useCrm();
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('TODOS');
  const [moduleFilter, setModuleFilter] = useState<HistoryModule>('TODOS');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | 'TODOS'>('TODOS');
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<{ item: StatusHistory; sale: Sale | undefined; role: Role } | null>(null);
  const pageSize = 8;

  if (isLoading) return <PageSkeleton cards={5} tableRows={8} tableColumns={8} />;

  const enrichedRows = useMemo(() => {
    if (!user) return [];
    return history
      .map((item) => {
        const sale = sales.find((entry) => entry.id === item.venta_id);
        if (sale && !canViewSale(user, sale)) return null;
        return { item, sale };
      })
      .filter((row): row is { item: StatusHistory; sale: ReturnType<typeof sales.find> } => row !== null);
  }, [history, sales, user]);

  const filteredRows = useMemo(() => {
    const text = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;
    return enrichedRows.filter(({ item, sale }) => {
      if (userFilter !== 'TODOS' && item.usuario_id !== userFilter) return false;
      if (statusFilter !== 'TODOS' && item.estado_nuevo !== statusFilter) return false;
      if (fromTime !== null && new Date(item.created_at).getTime() < fromTime) return false;
      if (toTime !== null && new Date(item.created_at).getTime() > toTime) return false;
      if (text) {
        const haystack = [
          item.usuario_nombre,
          item.comentario,
          STATUS_LABELS[item.estado_anterior],
          STATUS_LABELS[item.estado_nuevo],
          sale?.nombres_cliente ?? '',
          sale?.numero_documento ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [dateFrom, dateTo, enrichedRows, query, statusFilter, userFilter]);

  const totalEvents = enrichedRows.length;
  const uniqueUsers = new Set(enrichedRows.map((row) => row.item.usuario_id)).size;
  const statusChanges = enrichedRows.length;
  const lastDayIso = useMemo(() => {
    if (!enrichedRows.length) return null;
    return enrichedRows
      .map((row) => row.item.created_at)
      .sort()
      .reverse()[0];
  }, [enrichedRows]);
  const recent24h = lastDayIso
    ? enrichedRows.filter((row) => {
        const diff = Date.now() - new Date(row.item.created_at).getTime();
        return diff <= 1000 * 60 * 60 * 24 * 7;
      }).length
    : 0;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const clearFilters = () => {
    setQuery('');
    setDateFrom('');
    setDateTo('');
    setUserFilter('TODOS');
    setModuleFilter('TODOS');
    setStatusFilter('TODOS');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Auditoria del sistema</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Revisa movimientos, cambios de estado y actividad operativa del sistema.
          </p>
        </div>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar auditoria
        </button>
      </div>

      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="grid items-end gap-4 xl:grid-cols-[360px_1fr_1fr_1fr_auto]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">Rango de fechas</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <DateInput value={dateFrom} onChange={setDateFrom} placeholder="Desde" />
              <DateInput value={dateTo} onChange={setDateTo} placeholder="Hasta" />
            </div>
          </div>

          <FilterSelect
            label="Usuario"
            value={userFilter}
            onChange={(value) => {
              setUserFilter(value);
              setPage(1);
            }}
            options={[
              { value: 'TODOS', label: 'Todos' },
              ...profiles.map((profile) => ({ value: profile.id, label: profile.nombres })),
            ]}
          />

          <FilterSelect
            label="Modulo"
            value={moduleFilter}
            onChange={(value) => setModuleFilter(value as HistoryModule)}
            options={(Object.keys(MODULE_LABELS) as HistoryModule[]).map((moduleKey) => ({ value: moduleKey, label: MODULE_LABELS[moduleKey] }))}
          />

          <FilterSelect
            label="Estado"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as SaleStatus | 'TODOS');
              setPage(1);
            }}
            options={[
              { value: 'TODOS', label: 'Todos' },
              ...(Object.keys(STATUS_LABELS) as SaleStatus[]).map((status) => ({ value: status, label: STATUS_LABELS[status] })),
            ]}
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="h-12 w-full min-w-[116px] rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] hover:bg-[#FFF2E7]"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7F78]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por cliente, usuario, comentario..."
              className="h-11 w-full rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] pl-11 pr-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Total eventos"
          value={totalEvents}
          icon={Calendar}
          tone="orange"
        />
        <Metric label="Usuarios activos" value={uniqueUsers} icon={Users} tone="cyan" />
        <Metric label="Cambios estado" value={statusChanges} icon={Calendar} tone="orange" />
        <Metric label="Recientes (7d)" value={recent24h} icon={Calendar} tone="green" />
        <Metric
          label="Ultimo movimiento"
          value={lastDayIso ? <DateTimeMetric value={lastDayIso} /> : '-'}
          icon={Calendar}
          tone="muted"
          small
        />
      </section>

      <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#FFFCFA] text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">
                <th className="px-5 py-4">Fecha y hora</th>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Modulo</th>
                <th className="px-5 py-4">Accion</th>
                <th className="w-[34%] px-5 py-4">Descripcion</th>
                <th className="px-5 py-4 text-center">Estado</th>
                <th className="px-5 py-4">Origen</th>
                <th className="px-5 py-4 text-center">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EAE3]">
              {pagedRows.length ? (
                pagedRows.map(({ item, sale }) => {
                  const moduleKey = moduleFromSale(sale, item.estado_nuevo);
                  const role = roleFromUserId(item.usuario_id, profiles);
                  return (
                    <tr key={item.id} className="transition hover:bg-[#FFFCFA]">
                      <td className="whitespace-nowrap px-5 py-4 text-[13px] font-semibold text-[#4B3024]">
                        <span className="block font-extrabold text-[#1F1F1F]">{formatDateOnly(item.created_at)}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#8A7F78]">{formatTimeOnly(item.created_at)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFE2CC] text-[11px] font-extrabold text-[#A83B00]">
                            {initials(item.usuario_nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-extrabold text-[#1F1F1F]">
                              {item.usuario_nombre}
                            </p>
                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${roleBadge(role)}`}
                            >
                              {ROLE_LABELS[role]}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#F3EAE3] px-3 py-1 text-[11px] font-extrabold text-[#4B3024]">
                          {MODULE_LABELS[moduleKey]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${actionTone('CAMBIO')}`}
                        >
                          Cambio
                        </span>
                      </td>
                      <td className="max-w-[360px] px-5 py-4">
                        <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#4B3024]">
                          {describeChange(item, sale ?? undefined)}
                        </p>
                        {item.comentario && (
                          <p className="mt-1 line-clamp-1 text-[12px] font-medium text-[#8A7F78]">
                            {item.comentario}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex min-h-8 max-w-[148px] items-center justify-center rounded-full px-3 py-1 text-center text-[10px] font-extrabold leading-tight ${statusTone(item.estado_nuevo)}`}
                          title={STATUS_LABELS[item.estado_nuevo]}
                        >
                          {STATUS_LABELS[item.estado_nuevo]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-[12px] font-semibold text-[#8A7F78]">
                        {ipFromId(item.id)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRow({ item, sale, role })}
                          aria-label="Ver detalle del evento"
                          title="Ver detalle"
                          className="inline-grid h-9 w-9 place-items-center rounded-[10px] border border-[#E8D8CC] bg-white text-[#C94A00] transition hover:border-[#FF7A1A] hover:bg-[#FFF2E7]"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <p className="text-sm font-extrabold text-[#4B3024]">No hay eventos que coincidan con los filtros.</p>
                    <p className="mt-1 text-xs font-semibold text-[#8A7F78]">
                      Ajusta el rango de fechas o limpia los filtros para ver mas resultados.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#F3EAE3] bg-[#FFFCFA] px-5 py-4 sm:flex-row">
          <p className="text-xs font-semibold text-[#6B625C]">
            {filteredRows.length === 0 ? (
              'Sin eventos para mostrar'
            ) : totalPages === 1 ? (
              <>
                Mostrando <span className="font-extrabold text-[#1F1F1F]">{filteredRows.length}</span>{' '}
                {filteredRows.length === 1 ? 'evento' : 'eventos'}
              </>
            ) : (
              <>
                Mostrando{' '}
                <span className="font-extrabold text-[#1F1F1F]">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                a{' '}
                <span className="font-extrabold text-[#1F1F1F]">
                  {Math.min(currentPage * pageSize, filteredRows.length)}
                </span>{' '}
                de <span className="font-extrabold text-[#1F1F1F]">{filteredRows.length}</span> eventos
              </>
            )}
          </p>
          <div className="flex items-center gap-1">
            <PageButton
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              ariaLabel="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </PageButton>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 5)
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-[10px] px-3 text-xs font-extrabold transition ${
                    pageNumber === currentPage
                      ? 'bg-gradient-to-r from-[#F24A00] to-[#C94A00] text-white shadow-[0_10px_18px_rgba(201,74,0,0.22)]'
                      : 'text-[#6B625C] hover:bg-[#FFF2E7]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
            {totalPages > 5 && <span className="px-1 text-xs font-bold text-[#8A7F78]">...</span>}
            <PageButton
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              ariaLabel="Pagina siguiente"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </PageButton>
          </div>
        </div>
      </section>

      <HistoryDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
}

function DateInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block" title={placeholder}>
      <DateControl value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</span>
      <div className="mt-2">
        <ComboBox value={value} onChange={onChange} options={options} />
      </div>
    </label>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
  small = false,
}: {
  label: string;
  value: number | string | React.ReactNode;
  icon: typeof Calendar;
  tone: 'orange' | 'cyan' | 'green' | 'red' | 'muted';
  small?: boolean;
}) {
  const tones = {
    orange: 'bg-[#FFE2CC] text-[#A83B00]',
    cyan: 'bg-[#EAF3FF] text-[#005DE8]',
    green: 'bg-[#DDF8E9] text-[#2FA66A]',
    red: 'bg-[#FFE8E8] text-[#D64545]',
    muted: 'bg-[#F3EAE3] text-[#6B625C]',
  };
  return (
    <section
      className="flex h-[88px] items-center gap-4 rounded-[18px] border border-[#EDE4DC] bg-white p-4 shadow-[0_10px_24px_rgba(91,47,20,0.04)]"
    >
      <div className={`grid h-11 w-11 place-items-center rounded-[13px] ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</p>
        <p
          className={`mt-0.5 font-extrabold tracking-[-0.01em] text-[#1F1F1F] ${
            small ? 'text-sm' : 'text-[22px]'
          }`}
        >
          {value}
        </p>
      </div>
    </section>
  );
}

function DateTimeMetric({ value }: { value: string }) {
  return (
    <span className="block leading-tight">
      <span className="block text-sm">{formatDateOnly(value)}</span>
      <span className="mt-1 block text-xs font-semibold text-[#8A7F78]">{formatTimeOnly(value)}</span>
    </span>
  );
}

function HistoryDetailModal({
  row,
  onClose,
}: {
  row: { item: StatusHistory; sale: Sale | undefined; role: Role } | null;
  onClose: () => void;
}) {
  if (!row) return null;

  const { item, sale, role } = row;

  return (
    <Modal open={Boolean(row)} onClose={onClose} className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[720px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#F3EAE3] px-6 py-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8A7F78]">Detalle del evento</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#1F1F1F]">Cambio de estado</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="grid h-9 w-9 place-items-center rounded-[10px] text-[#6B625C] transition hover:bg-[#FFF2E7]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Fecha" value={formatDateOnly(item.created_at)} />
          <DetailItem label="Hora" value={formatTimeOnly(item.created_at)} />
          <DetailItem label="Usuario" value={item.usuario_nombre} />
          <DetailItem label="Rol" value={ROLE_LABELS[role]} />
          <DetailItem label="Cliente" value={sale?.nombres_cliente ?? 'Sin venta asociada'} />
          <DetailItem label="Origen" value={ipFromId(item.id)} />
        </div>

        <div className="mt-5 rounded-[16px] border border-[#F1DAC8] bg-[#FFFCFA] p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">Estados</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-xs font-extrabold ${statusTone(item.estado_anterior)}`}>
              {STATUS_LABELS[item.estado_anterior]}
            </span>
            <ChevronRight className="h-4 w-4 text-[#8A7F78]" aria-hidden="true" />
            <span className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-xs font-extrabold ${statusTone(item.estado_nuevo)}`}>
              {STATUS_LABELS[item.estado_nuevo]}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] border border-[#F1DAC8] bg-white p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">Descripcion completa</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#4B3024]">{describeChange(item, sale)}</p>
          {item.comentario && (
            <>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">Comentario</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#4B3024]">{item.comentario}</p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#F1DAC8] bg-[#FFFCFA] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#1F1F1F]">{value}</p>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-[10px] text-[#6B625C] transition hover:bg-[#FFF2E7] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
