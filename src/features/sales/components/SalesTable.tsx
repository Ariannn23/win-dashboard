import { Edit3, Eye, History, MoreHorizontal, RefreshCw, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { initials } from '@/shared/lib/format';
import { canChangeStatus, canEditSale } from '@/shared/lib/permissions';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PAGE_SIZE, Pagination } from '@/shared/ui/Pagination';
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
  const [page, setPage] = useState(1);
  const getName = (id: string) => profiles.find((profile) => profile.id === id)?.nombres ?? 'Sin asignar';
  const totalPages = Math.max(1, Math.ceil(sales.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedSales = sales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [sales.length]);

  if (!sales.length) return <EmptyState title="No se encontraron ventas" />;

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white shadow-[0_14px_34px_rgba(91,47,20,0.055)] print:m-0 print:border-none print:shadow-none">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="min-w-[1120px] w-full border-collapse text-[13px] print:min-w-0 print:w-full print:table-fixed print:text-xs">
          <thead>
            <tr className="border-b border-[#E0BDAA] bg-[#FFF2E7] text-left text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#4B3024] print:text-[9px]">
              <th className="w-[104px] px-5 py-4 print:px-2">ID Venta</th>
              <th className="px-4 py-4 print:px-2">Cliente</th>
              <th className="px-4 py-4 print:px-2">Servicio</th>
              <th className="px-4 py-4 print:px-2">Plan</th>
              <th className="px-4 py-4 print:px-2">Supervisor</th>
              <th className="px-4 py-4 print:px-2">Asesor</th>
              <th className="px-4 py-4 print:px-2">Fecha</th>
              <th className="px-4 py-4 print:px-2">Estado</th>
              <th className="print:hidden px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE4DC]">
            {pagedSales.map((sale, index) => (
              <tr key={sale.id} className="transition hover:bg-[#FFF8F3]">
                <td className="px-5 py-4 align-middle print:px-2">
                  <span className="font-extrabold leading-5 text-[#A32800]">
                    VT-{new Date(sale.created_at).getFullYear()}-{String((currentPage - 1) * PAGE_SIZE + index + 581).padStart(5, '0')}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle print:px-2 print:break-all">
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
                <td className="px-4 py-4 align-middle print:px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#4B3024]">
                      {sale.plan_contratar.toLowerCase().includes('fono') || sale.plan_contratar.toLowerCase().includes('dúo') || sale.plan_contratar.toLowerCase().includes('duo') ? 'Dúo' : 'Internet'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle print:px-2">
                  <div className="font-semibold text-[#4B3024]">{formatPlan(sale.plan_contratar)}</div>
                </td>
                <td className="px-4 py-4 align-middle print:px-2">
                  <div className="font-semibold text-[#4B3024]">
                    {profiles.find((p) => p.id === sale.supervisor_id)?.nombres.split(' ')[0] ?? 'No asignado'}
                  </div>
                </td>
                <td className="px-4 py-4 align-middle print:px-2">
                  <div className="font-semibold text-[#4B3024]">
                    {profiles.find((p) => p.id === sale.asesor_id)?.nombres.split(' ')[0] ?? 'No asignado'}
                  </div>
                </td>
                <td className="px-4 py-4 align-middle print:px-2">
                  <span className="font-semibold text-[#8A7F78]">{formatShortDate(sale.created_at)}</span>
                </td>
                <td className="px-4 py-4 align-middle print:px-2">
                  <SaleStatusPill status={sale.estado} />
                </td>
                <td className="print:hidden px-5 py-4 text-right align-middle">
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
                    {user.rol === 'BACK' && sale.estado === 'PENDIENTE_GRABACION' && (
                      <button
                        type="button"
                        onClick={() => onStatus(sale)}
                        className="ml-1 rounded-[10px] bg-[#FFE2CC] px-3 py-1.5 text-xs font-extrabold text-[#C94A00] transition hover:bg-[#FFD8CA]"
                      >
                        Revisar
                      </button>
                    )}

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
                        {canChangeStatus(user, sale) && (
                          <ActionItem
                            icon={RefreshCw}
                            label="Actualizar estado"
                            onClick={() => {
                              setOpenMenuId(null);
                              onStatus(sale);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="print:hidden p-4">
        <Pagination page={currentPage} totalItems={sales.length} itemLabel="ventas" onPageChange={setPage} />
      </section>
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
  return (
    <>
      <span className="block">{plan}</span>
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

function SaleStatusPill({ status }: { status: Sale['estado'] }) {
  const styles: Record<Sale['estado'], string> = {
    PENDIENTE_GRABACION: 'bg-[#FFF1C7] text-[#B46A00]',
    PROGRAMADO_GRABACION: 'bg-[#EEF2FF] text-[#4338CA]',
    GRABADO: 'bg-[#EAF3FF] text-[#2F80ED]',
    PROGRAMADO_INSTALACION: 'bg-[#F4EBFF] text-[#7A3BCC]',
    INSTALADO: 'bg-[#DDF8E9] text-[#2FA66A]',
    RECHAZADO: 'bg-[#FFE8E8] text-[#D64545]',
    CANCELADO: 'bg-[#F3EAE3] text-[#6B625C]',
  };
  
  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
