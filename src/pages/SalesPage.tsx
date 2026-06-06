import { AlertTriangle, Ban, CheckCircle2, Clock3, Download, Eraser, Filter, Plus, RotateCcw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { canCreateSales, canExportData } from '@/shared/lib/permissions';
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
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseSales = useMemo(() => user ? visibleSales(user) : [], [user, visibleSales]);
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
  }, [advisor, supervisor, baseSales, query, status]);

  const exportToExcel = () => {
    const headers = ['ID Venta', 'Cliente', 'Servicio', 'Plan', 'Supervisor', 'Asesor', 'Fecha', 'Estado'];
    const rows = filteredSales.map((sale, index) => {
      const idVenta = `VT-${new Date(sale.created_at).getFullYear()}-${String(index + 581).padStart(5, '0')}`;
      const supervisor = profiles.find((p) => p.id === sale.supervisor_id)?.nombres || 'No asignado';
      const asesor = profiles.find((p) => p.id === sale.asesor_id)?.nombres || 'No asignado';
      
      return [
        idVenta,
        sale.nombres_cliente,
        'Internet',
        sale.plan_contratar,
        supervisor,
        asesor,
        new Date(sale.created_at).toLocaleDateString(),
        STATUS_LABELS[sale.estado]
      ];
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
    XLSX.writeFile(workbook, `ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!user) return null;
  if (isLoading) return <PageSkeleton cards={5} tableRows={7} tableColumns={8} />;

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
      <section className="print:hidden flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
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
            className="fixed bottom-[84px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F24A00] to-[#C94A00] text-white shadow-[0_14px_30px_rgba(201,74,0,0.4)] transition-transform hover:scale-105 active:scale-95 xl:static xl:h-11 xl:w-auto xl:rounded-[14px] xl:px-5 xl:shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
          >
            <Plus className="h-6 w-6 xl:mr-2 xl:h-4 xl:w-4" aria-hidden="true" />
            <span className="hidden xl:inline">Registrar venta</span>
          </button>
        )}
      </section>

      <section className="print:hidden grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SalesMetric icon={CheckCircle2} label="Completadas" value={completed} tone="success" />
        <SalesMetric icon={RotateCcw} label="En Proceso" value={inProcess} tone="info" />
        <SalesMetric icon={Clock3} label="Pendientes" value={pending} tone="warning" />
        <SalesMetric icon={AlertTriangle} label="Vencidas" value={overdue} tone="danger" />
        <SalesMetric icon={Ban} label="Canceladas" value={canceled} tone="muted" />
      </section>

      <section className="print:hidden rounded-[20px] border border-[#EDE4DC] bg-white p-6 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
        <div className={`grid items-end gap-4 ${user.rol === 'ASESOR' ? 'xl:grid-cols-[1.5fr_1fr_auto]' : ['ADMIN', 'BACK'].includes(user.rol) ? 'xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]' : 'xl:grid-cols-[1.2fr_1fr_1fr_auto]'}`}>
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

          {['ADMIN', 'BACK'].includes(user.rol) && (
            <FilterField label="Supervisor">
              <FilterSelect
                value={supervisor}
                onChange={(val) => {
                  setSupervisor(val);
                  setAdvisor('TODOS');
                }}
                options={[
                  { value: 'TODOS', label: 'Todos' },
                  ...profiles.filter((p) => p.rol === 'SUPERVISOR').map((p) => ({ value: p.id, label: p.nombres })),
                ]}
              />
            </FilterField>
          )}

          {user.rol !== 'ASESOR' && (
            <FilterField label="Asesor">
              <FilterSelect
                value={advisor}
                onChange={setAdvisor}
                options={[
                  { value: 'TODOS', label: 'Todos' },
                  ...profiles
                    .filter((p) => p.rol === 'ASESOR' && (supervisor === 'TODOS' || p.supervisor_id === supervisor))
                    .map((p) => ({ value: p.id, label: p.nombres })),
                ]}
              />
            </FilterField>
          )}

          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] transition hover:bg-[#FFF2E7] hover:text-[#A83B00]"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
            {canExportData(user) && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex h-12 items-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Exportar
                </button>
                {exportOpen && (
                  <div className="absolute right-0 top-14 z-20 w-40 overflow-hidden rounded-[14px] border border-[#E8D8CC] bg-white p-1.5 shadow-[0_18px_45px_rgba(91,47,20,0.14)]">
                    <button
                      onClick={() => {
                        setExportOpen(false);
                        exportToExcel();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#4B3024] hover:bg-[#FFF2E7]"
                    >
                      Exportar a Excel
                    </button>
                    <button
                      onClick={() => {
                        setExportOpen(false);
                        window.print();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#4B3024] hover:bg-[#FFF2E7]"
                    >
                      Imprimir a PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
          onSubmit={async (values) => {
            try {
              await upsertSale({
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
            } catch (error) {
              showToast({
                title: 'No se pudo guardar la venta',
                detail: error instanceof Error ? error.message : 'Intentalo nuevamente.',
                tone: 'error',
              });
            }
          }}
        />
      )}

      {statusSale && (
        <StatusChangeModal
          sale={statusSale}
          history={history.filter((item) => item.venta_id === statusSale.id)}
          onClose={() => setStatusSale(null)}
          onSubmit={async (nextStatus, comment) => {
            try {
              await changeSaleStatus(statusSale.id, nextStatus, user, comment);
              showToast({
                title: 'Estado actualizado',
                detail: 'El movimiento quedo registrado en el historial.',
                tone: 'success',
              });
              setStatusSale(null);
            } catch (error) {
              showToast({
                title: 'No se pudo cambiar el estado',
                detail: error instanceof Error ? error.message : 'Intentalo nuevamente.',
                tone: 'error',
              });
            }
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
