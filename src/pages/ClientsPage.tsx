import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  UsersRound,
  Wifi,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { formatMoney, formatShortDate, initials } from '@/shared/lib/format';
import {
  CLIENT_STATUS_LABELS,
  clientStatus,
  clientType,
  saleAmount,
  speedFromPlan,
  type ClientStatus,
  type ClientType,
} from '@/shared/lib/sales';
import { ComboBox, type SelectOption } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { PageSkeleton } from '@/shared/ui/Skeleton';
import type { Sale } from '@/types';

type ClientStatusFilter = 'TODOS' | ClientStatus;
type ClientTypeFilter = 'TODOS' | ClientType;

function statusTone(status: ClientStatus) {
  return {
    ACTIVO: 'bg-[#DDF8E9] text-[#009A4E]',
    SUSPENDIDO: 'bg-[#FFF2E7] text-[#D63B00]',
    MOROSO: 'bg-[#FFE8E8] text-[#D64545]',
    INACTIVO: 'bg-[#F3EAE3] text-[#6B625C]',
  }[status];
}

function typeTone(type: ClientType) {
  return type === 'HOGAR' ? 'bg-[#EAF3FF] text-[#005DE8]' : 'bg-[#FFF2E7] text-[#D63B00]';
}

export function ClientsPage() {
  const { user } = useAuth();
  const { isLoading, visibleSales } = useCrm();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ClientStatusFilter>('TODOS');
  const [type, setType] = useState<ClientTypeFilter>('TODOS');
  const [plan, setPlan] = useState('TODOS');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  if (!user) return null;
  if (isLoading) return <PageSkeleton cards={4} tableRows={6} tableColumns={8} />;

  const clients = visibleSales(user);
  const plans = Array.from(new Set(clients.map((sale) => sale.plan_contratar)));
  const active = clients.filter((sale) => clientStatus(sale.estado) === 'ACTIVO').length;
  const suspended = clients.filter((sale) => clientStatus(sale.estado) === 'SUSPENDIDO').length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = clients.filter((sale) => {
    const created = new Date(sale.created_at);
    return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
  }).length;

  const filteredClients = useMemo(() => {
    const text = query.trim().toLowerCase();
    return clients.filter((sale) => {
      const saleStatus = clientStatus(sale.estado);
      const saleType = clientType(sale);
      const matchesText =
        !text ||
        sale.nombres_cliente.toLowerCase().includes(text) ||
        sale.numero_documento.includes(text) ||
        sale.correo_cliente.toLowerCase().includes(text) ||
        sale.celular_principal.includes(text);
      const matchesStatus = status === 'TODOS' || saleStatus === status;
      const matchesType = type === 'TODOS' || saleType === type;
      const matchesPlan = plan === 'TODOS' || sale.plan_contratar === plan;
      return matchesText && matchesStatus && matchesType && matchesPlan;
    });
  }, [clients, plan, query, status, type]);

  const clearFilters = () => {
    setQuery('');
    setStatus('TODOS');
    setType('TODOS');
    setPlan('TODOS');
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Clientes</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Administra clientes registrados desde ventas, servicio contratado y estado de conexion.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/ventas')}
          className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo cliente
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ClientMetric icon={UsersRound} label="Total de clientes" value={clients.length} trend="12.5%" tone="orange" />
        <ClientMetric icon={CheckCircle2} label="Clientes activos" value={active} trend="10.3%" tone="green" />
        <ClientMetric icon={Calendar} label="Suspendidos" value={suspended} trend="3.4%" tone="amber" negative />
        <ClientMetric icon={Plus} label="Nuevos este mes" value={newThisMonth} trend="8.7%" tone="blue" />
      </section>

      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.75fr_0.75fr_1fr]">
          <label className="relative block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">Buscar cliente</span>
            <Search className="pointer-events-none absolute left-4 top-[41px] h-4 w-4 text-[#8A7F78]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="DNI, RUC, nombre o telefono..."
              className="h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] pl-11 pr-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <FilterSelect
            label="Estado"
            value={status}
            onChange={(value) => setStatus(value as ClientStatusFilter)}
            options={[{ value: 'TODOS', label: 'Todos' }, ...Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
          />
          <FilterSelect
            label="Tipo"
            value={type}
            onChange={(value) => setType(value as ClientTypeFilter)}
            options={[
              { value: 'TODOS', label: 'Todos' },
              { value: 'HOGAR', label: 'Hogar' },
              { value: 'EMPRESA', label: 'Empresa' },
            ]}
          />
          <FilterSelect
            label="Plan"
            value={plan}
            onChange={setPlan}
            options={[{ value: 'TODOS', label: 'Todos' }, ...plans.map((item) => ({ value: item, label: item }))]}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-[#F3EAE3] pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-[13px] bg-[#A83B00] px-5 text-sm font-extrabold text-white shadow-[0_10px_18px_rgba(168,59,0,0.18)]"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtrar
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-[13px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] hover:bg-[#FFF2E7]"
            >
              Limpiar filtros
            </button>
          </div>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-[13px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-sm">
            <thead>
              <tr className="border-b border-[#E0BDAA] bg-[#FFF2E7] text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">
                <th className="px-5 py-4">Cliente</th>
                <th className="px-4 py-4">DNI / RUC</th>
                <th className="px-4 py-4">Telefono</th>
                <th className="px-4 py-4">Correo</th>
                <th className="px-4 py-4">Tipo</th>
                <th className="px-4 py-4">Plan actual</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Registro</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4DC]">
              {filteredClients.map((sale) => {
                const saleStatus = clientStatus(sale.estado);
                const saleType = clientType(sale);
                return (
                  <tr key={sale.id} className="transition hover:bg-[#FFFCFA]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FFE2CC] text-[11px] font-extrabold text-[#C94A00]">
                          {initials(sale.nombres_cliente)}
                        </span>
                        <div>
                          <p className="font-extrabold text-[#1F1F1F]">{sale.nombres_cliente}</p>
                          <p className="text-xs font-semibold text-[#8A7F78]">{sale.distrito}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#4B3024]">{sale.numero_documento}</td>
                    <td className="px-4 py-4 font-semibold text-[#4B3024]">{sale.celular_principal}</td>
                    <td className="px-4 py-4 font-semibold text-[#4B3024]">{sale.correo_cliente}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${typeTone(saleType)}`}>
                        {saleType === 'HOGAR' ? 'Hogar' : 'Empresa'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#4B3024]">{speedFromPlan(sale.plan_contratar)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${statusTone(saleStatus)}`}>
                        {CLIENT_STATUS_LABELS[saleStatus]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#4B3024]">{formatShortDate(sale.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedSale(sale)}
                          title="Ver cliente"
                          className="grid h-8 w-8 place-items-center rounded-xl text-[#6B625C] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          title="Editar cliente"
                          className="grid h-8 w-8 place-items-center rounded-xl text-[#6B625C] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
                        >
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E0BDAA] px-5 py-4 text-xs font-semibold text-[#4B3024] sm:flex-row">
          <p>
            Mostrando <span className="font-extrabold">{filteredClients.length}</span>{' '}
            {filteredClients.length === 1 ? 'cliente' : 'clientes'}
          </p>
          <div className="flex items-center gap-2">
            <PageButton disabled>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </PageButton>
            <button className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#A83B00] text-xs font-extrabold text-white" type="button">
              1
            </button>
            <PageButton disabled>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </PageButton>
          </div>
        </div>
      </section>

      {selectedSale && <ClientDetailPanel sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
}

function ClientMetric({
  icon: Icon,
  label,
  value,
  trend,
  tone,
  negative = false,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
  trend: string;
  tone: 'orange' | 'green' | 'amber' | 'blue';
  negative?: boolean;
}) {
  const tones = {
    orange: 'bg-[#FFE2CC] text-[#C94A00]',
    green: 'bg-[#DDF8E9] text-[#009A4E]',
    amber: 'bg-[#FFF2E7] text-[#D63B00]',
    blue: 'bg-[#EAF3FF] text-[#005DE8]',
  };

  return (
    <section className="flex h-[112px] items-center gap-4 rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
      <div className={`grid h-12 w-12 place-items-center rounded-full ${tones[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#6B625C]">{label}</p>
        <p className="mt-1 text-2xl font-extrabold tracking-[-0.025em] text-[#1F1F1F]">{value.toLocaleString('es-PE')}</p>
        <p className={`mt-1 text-xs font-extrabold ${negative ? 'text-[#D64545]' : 'text-[#009A4E]'}`}>
          {negative ? '↑' : '↑'} {trend}
        </p>
      </div>
    </section>
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
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</span>
      <ComboBox value={value} onChange={onChange} options={options} />
    </label>
  );
}

function ClientDetailPanel({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const saleStatus = clientStatus(sale.estado);
  const saleType = clientType(sale);
  const monthlyPrice = saleAmount(sale);

  return (
    <Modal
      open
      onClose={onClose}
      className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-7 py-5">
        <h2 className="text-xl font-extrabold text-[#1F1F1F]">Detalle del cliente</h2>
        <button type="button" onClick={onClose} title="Cerrar" className="grid h-9 w-9 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7]">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="hidden-scrollbar flex-1 space-y-5 overflow-y-auto px-7 py-6">
        <section className="rounded-[22px] bg-[#FFF2E7] p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FFD8CA] text-xl font-extrabold text-[#C94A00]">
              {initials(sale.nombres_cliente)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#1F1F1F]">{sale.nombres_cliente}</h3>
                <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${statusTone(saleStatus)}`}>
                  {CLIENT_STATUS_LABELS[saleStatus]}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#6B625C]">Cliente desde el {formatShortDate(sale.created_at)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 text-sm font-semibold text-[#4B3024]">
          <ContactRow icon={Phone} value={sale.celular_principal} />
          <ContactRow icon={Mail} value={sale.correo_cliente} />
          <ContactRow icon={Calendar} value={`${sale.tipo_documento} ${sale.numero_documento}`} />
          <ContactRow icon={MapPin} value={`${sale.distrito} · ${sale.direccion}`} />
        </section>

        <section className="rounded-[18px] border border-[#E8D8CC] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Servicio contratado</p>
            <button type="button" className="text-xs font-extrabold text-[#C94A00]">Editar</button>
          </div>
          <div className="mt-4 rounded-[16px] border border-[#F1DAC8] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FFF2E7] text-[#C94A00]">
                <Wifi className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-extrabold text-[#1F1F1F]">{saleType === 'HOGAR' ? 'Hogar' : 'Empresa'} {speedFromPlan(sale.plan_contratar)}</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${typeTone(saleType)}`}>
                  {saleType === 'HOGAR' ? 'Residencial' : 'Empresa'}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <DetailStat label="Velocidad" value={speedFromPlan(sale.plan_contratar)} />
              <DetailStat label="Mensual" value={formatMoney(monthlyPrice)} />
              <DetailStat label="Instalacion" value="S/ 50.00" />
            </div>
            <p className="mt-4 text-xs font-semibold text-[#8A7F78]">Fecha de instalacion</p>
            <p className="mt-1 text-sm font-extrabold text-[#1F1F1F]">{formatShortDate(sale.updated_at)}</p>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#E8D8CC] bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Estado de cuenta</p>
            <span className="rounded-full bg-[#DDF8E9] px-3 py-1 text-[11px] font-extrabold text-[#009A4E]">Al dia</span>
          </div>
          <div className="mt-4 divide-y divide-[#F1DAC8] overflow-hidden rounded-[15px] border border-[#F1DAC8]">
            <AccountRow label="Pagos al dia" value="12 meses" />
            <AccountRow label="Deuda pendiente" value="S/ 0.00" success />
            <AccountRow label="Ultimo pago" value={formatMoney(monthlyPrice)} detail={formatShortDate(sale.updated_at)} />
          </div>
        </section>

        <section>
          <div className="flex gap-5 border-b border-[#E8D8CC] text-sm font-extrabold">
            <button type="button" className="border-b-2 border-[#C94A00] pb-2 text-[#C94A00]">Historial</button>
            <button type="button" className="pb-2 text-[#6B625C]">Ventas</button>
            <button type="button" className="pb-2 text-[#6B625C]">Tickets</button>
            <button type="button" className="pb-2 text-[#6B625C]">Documentos</button>
          </div>
          <div className="mt-4 space-y-4">
            <TimelineItem tone="blue" title="Venta creada" detail={`por ${sale.nombres_cliente}`} date={formatShortDate(sale.created_at)} />
            <TimelineItem tone="green" title={STATUS_LABELS[sale.estado]} detail="Estado actual del servicio" date={formatShortDate(sale.updated_at)} />
            <TimelineItem tone="orange" title="Plan contratado" detail={sale.plan_contratar} date={formatShortDate(sale.created_at)} />
          </div>
        </section>
      </div>

      <div className="grid shrink-0 gap-3 border-t border-[#E8D8CC] bg-[#FFFCFA] p-5 sm:grid-cols-2">
        <button type="button" className="h-11 rounded-[13px] border border-[#F24A00] bg-white text-sm font-extrabold text-[#C94A00]">
          Editar cliente
        </button>
        <button type="button" className="h-11 rounded-[13px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] text-sm font-extrabold text-white shadow-[0_12px_18px_rgba(201,74,0,0.18)]">
          Crear ticket
        </button>
      </div>
    </Modal>
  );
}

function ContactRow({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-[#6B625C]" aria-hidden="true" />
      <span>{value}</span>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#1F1F1F]">{value}</p>
    </div>
  );
}

function AccountRow({ label, value, detail, success = false }: { label: string; value: string; detail?: string; success?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm font-semibold text-[#4B3024]">{label}</span>
      <span className={`text-right text-sm font-extrabold ${success ? 'text-[#009A4E]' : 'text-[#1F1F1F]'}`}>
        {value}
        {detail && <span className="block text-[10px] font-semibold text-[#8A7F78]">{detail}</span>}
      </span>
    </div>
  );
}

function TimelineItem({ tone, title, detail, date }: { tone: 'blue' | 'green' | 'orange'; title: string; detail: string; date: string }) {
  const tones = {
    blue: 'bg-[#EAF3FF] text-[#005DE8]',
    green: 'bg-[#DDF8E9] text-[#009A4E]',
    orange: 'bg-[#FFF2E7] text-[#C94A00]',
  };

  return (
    <article className="flex gap-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tones[tone]}`}>
        <Calendar className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-extrabold text-[#1F1F1F]">{title}</p>
        <p className="text-xs font-semibold text-[#6B625C]">{detail}</p>
        <p className="mt-1 text-[11px] font-semibold text-[#8A7F78]">{date}</p>
      </div>
    </article>
  );
}

function PageButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-[10px] text-[#6B625C] transition hover:bg-[#FFF2E7] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
