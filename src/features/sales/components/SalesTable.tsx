import { Edit3, Eye, History, MoreHorizontal, RefreshCw, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { initials } from '@/shared/lib/format';
import { canEditSale } from '@/shared/lib/permissions';
import { EmptyState } from '@/shared/ui/EmptyState';
import type { Profile, Sale } from '@/types';

interface SalesTableProps {
  sales: Sale[];
  profiles: Profile[];
  user: Profile;
  onEdit: (sale: Sale) => void;
  onStatus: (sale: Sale) => void;
  onView: (sale: Sale) => void;
  onHistory: (sale: Sale) => void;
}

export function SalesTable({ sales, profiles, user, onEdit, onStatus, onView, onHistory }: SalesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const getName = (id: string) => profiles.find((profile) => profile.id === id)?.nombres ?? 'Sin asignar';

  if (!sales.length) return <EmptyState title="No se encontraron ventas" />;

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#E0BDAA] bg-[#FFF2E7] text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#4B3024]">
              <th className="w-[104px] px-5 py-4">ID Venta</th>
              <th className="px-4 py-4">Cliente</th>
              <th className="px-4 py-4">Servicio</th>
              <th className="px-4 py-4">Plan</th>
              <th className="px-4 py-4">Supervisor</th>
              <th className="px-4 py-4">Asesor</th>
              <th className="px-4 py-4">Fecha</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE4DC]">
            {sales.map((sale, index) => (
              <tr key={sale.id} className="transition hover:bg-[#FFF8F3]">
                <td className="px-5 py-4 align-middle">
                  <span className="font-extrabold leading-5 text-[#A32800]">
                    VT-
                    <br />
                    {new Date(sale.created_at).getFullYear()}-
                    <br />
                    {String(index + 581).padStart(5, '0')}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FFD8CA] text-[11px] font-extrabold text-[#8C2D00]">
                      {initials(sale.nombres_cliente)}
                    </div>
                    <div>
                      <p className="font-extrabold leading-5 text-[#1F1F1F]">{sale.nombres_cliente}</p>
                      <p className="text-[11px] font-semibold text-[#8A7F78]">{sale.tipo_documento} {sale.numero_documento}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-2.5 text-[#4B3024]">
                    <Wifi className="h-3.5 w-3.5 text-[#C94A00]" aria-hidden="true" />
                    <span className="font-semibold leading-5">
                      Internet
                      <span className="block">Residencial</span>
                    </span>
                  </div>
                </td>
                <td className="max-w-[130px] px-4 py-4 align-middle font-semibold leading-5 text-[#4B3024]">
                  {formatPlan(sale.plan_contratar)}
                </td>
                <td className="px-4 py-4 align-middle font-semibold leading-5 text-[#4B3024]">
                  {getName(sale.supervisor_id)}
                </td>
                <td className="px-4 py-4 align-middle font-semibold leading-5 text-[#4B3024]">
                  {getName(sale.asesor_id)}
                </td>
                <td className="px-4 py-4 align-middle font-semibold text-[#4B3024]">
                  {formatShortDate(sale.created_at)}
                </td>
                <td className="px-4 py-4 align-middle">
                  <SaleStatusPill status={sale.estado} />
                </td>
                <td className="px-5 py-4 align-middle">
                  <div className="relative flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(sale)}
                      title="Ver venta"
                      className="grid h-8 w-8 place-items-center rounded-xl text-[#8A7F78] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title="Mas acciones"
                      onClick={() => setOpenMenuId((value) => (value === sale.id ? null : sale.id))}
                      className="grid h-8 w-8 place-items-center rounded-xl text-[#8A7F78] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </button>

                    {openMenuId === sale.id && (
                      <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-[14px] border border-[#E8D8CC] bg-white p-1.5 shadow-[0_18px_45px_rgba(91,47,20,0.14)]">
                        <ActionItem
                          icon={History}
                          label="Ver historial"
                          onClick={() => {
                            setOpenMenuId(null);
                            onHistory(sale);
                          }}
                        />
                        {canEditSale(user, sale) && (
                          <ActionItem
                            icon={Edit3}
                            label="Editar venta"
                            onClick={() => {
                              setOpenMenuId(null);
                              onEdit(sale);
                            }}
                          />
                        )}
                        <ActionItem
                          icon={RefreshCw}
                          label="Actualizar estado"
                          onClick={() => {
                            setOpenMenuId(null);
                            onStatus(sale);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#E0BDAA] px-5 py-4 text-xs font-semibold text-[#4B3024]">
        <p>
          Mostrando 1 a {sales.length} de {sales.length} ventas
        </p>
        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#E8D8CC] text-[#4B3024]" type="button">
            1
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#A83B00] text-white" type="button">
            2
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-[12px] text-[#4B3024] hover:bg-[#FFF2E7]" type="button">
            3
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-[12px] text-[#4B3024] hover:bg-[#FFF2E7]" type="button">
            4
          </button>
        </div>
      </div>
    </section>
  );
}

function ActionItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-left text-xs font-extrabold text-[#4B3024] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function formatPlan(plan: string) {
  const speed = plan.match(/\d+\s?MBPS/)?.[0]?.replace('MBPS', 'Mbps') ?? plan;
  const category = plan.includes('1000') || plan.includes('750') ? 'Hogar' : 'Hogar';
  return (
    <>
      {category}
      <span className="block">{speed}</span>
    </>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getSimpleStatus(status: Sale['estado']) {
  if (status === 'INSTALADO') return 'COMPLETADA';
  if (status === 'CANCELADO') return 'CANCELADA';
  if (status === 'RECHAZADO') return 'VENCIDA';
  if (status === 'PENDIENTE_GRABACION') return 'PENDIENTE';
  return 'EN PROCESO';
}

function SaleStatusPill({ status }: { status: Sale['estado'] }) {
  const styles = {
    COMPLETADA: 'bg-[#DDF8E9] text-[#2FA66A]',
    'EN PROCESO': 'bg-[#EAF3FF] text-[#2F80ED]',
    PENDIENTE: 'bg-[#FFF1C7] text-[#B46A00]',
    VENCIDA: 'bg-[#FFE8E8] text-[#D64545]',
    CANCELADA: 'bg-[#F3EAE3] text-[#6B625C]',
  } satisfies Record<string, string>;
  const label = getSimpleStatus(status);

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles[label]}`}>
      {label}
    </span>
  );
}
