import { ArrowRight, CalendarClock, Circle, History as HistoryIcon, X } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { formatDate, initials } from '@/shared/lib/format';
import type { Sale, SaleStatus, StatusHistory } from '@/types';

interface HistoryPanelProps {
  sale: Sale;
  history: StatusHistory[];
  onClose: () => void;
}

function statusTone(status: SaleStatus) {
  const styles: Record<SaleStatus, string> = {
    PENDIENTE_GRABACION: 'bg-[#FFF1C7] text-[#B46A00]',
    PROGRAMADO_GRABACION: 'bg-[#EEF2FF] text-[#4338CA]',
    GRABADO: 'bg-[#EAF3FF] text-[#2F80ED]',
    PROGRAMADO_INSTALACION: 'bg-[#F4EBFF] text-[#7A3BCC]',
    INSTALADO: 'bg-[#DDF8E9] text-[#2FA66A]',
    RECHAZADO: 'bg-[#FFE8E8] text-[#D64545]',
    CANCELADO: 'bg-[#F3EAE3] text-[#6B625C]',
  };
  return styles[status] || 'bg-[#FFE2CC] text-[#A83B00]';
}

function statusDotTone(status: SaleStatus) {
  const styles: Record<SaleStatus, string> = {
    PENDIENTE_GRABACION: 'bg-[#B46A00]',
    PROGRAMADO_GRABACION: 'bg-[#4338CA]',
    GRABADO: 'bg-[#2F80ED]',
    PROGRAMADO_INSTALACION: 'bg-[#7A3BCC]',
    INSTALADO: 'bg-[#2FA66A]',
    RECHAZADO: 'bg-[#D64545]',
    CANCELADO: 'bg-[#6B625C]',
  };
  return styles[status] || 'bg-[#C94A00]';
}

export function HistoryPanel({ sale, history, onClose }: HistoryPanelProps) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <Modal
      open
      onClose={onClose}
      className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[680px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-7 py-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Historial de venta</h2>
          <p className="mt-1 text-sm font-semibold text-[#6B625C]">
            VT-{new Date(sale.created_at).getFullYear()}-{sale.numero_documento.slice(-5)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Cerrar"
          className="grid h-10 w-10 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7]"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="hidden-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-7 py-6">
        <section className="rounded-[20px] border border-[#E8B9A3] bg-[#FFF2E7] p-5">
          <div className="flex items-center gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-white bg-[#FFD8CA] text-base font-extrabold text-[#8C2D00]">
              {initials(sale.nombres_cliente)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-extrabold text-[#1F1F1F]">{sale.nombres_cliente}</p>
              <p className="mt-1 text-sm font-semibold text-[#6B625C]">
                {sale.tipo_documento} {sale.numero_documento}
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-2 rounded-full bg-[#FFE2CC] px-4 py-2 text-xs font-extrabold text-[#A83B00] sm:inline-flex">
              <HistoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {sortedHistory.length} {sortedHistory.length === 1 ? 'cambio' : 'cambios'}
            </span>
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-3 text-lg font-extrabold text-[#A32800]">
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
            Linea de tiempo
          </h3>

          {sortedHistory.length ? (
            <ol className="relative mt-7 space-y-7 pl-12">
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-[19px] top-3 w-[2px] rounded-full bg-gradient-to-b from-[#C94A00] via-[#E8B9A3] to-[#EDE4DC]"
              />
              {sortedHistory.map((item, index) => (
                <li key={item.id} className="relative">
                  <span
                    className={`absolute -left-12 top-1 grid h-10 w-10 place-items-center rounded-full border-4 border-white shadow-[0_4px_10px_rgba(31,31,31,0.08)] ${statusDotTone(item.estado_nuevo)}`}
                  >
                    <Circle className="h-2.5 w-2.5 fill-white text-white" aria-hidden="true" />
                  </span>
                  {index === 0 && (
                    <span className="absolute -left-12 -top-3 inline-flex h-5 items-center rounded-full bg-[#FFE2CC] px-2 text-[10px] font-extrabold uppercase tracking-wider text-[#A83B00] ring-2 ring-white">
                      Ultimo
                    </span>
                  )}
                  <article className="rounded-[18px] border border-[#EDE4DC] bg-white p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap ${statusTone(item.estado_anterior)}`}
                      >
                        {STATUS_LABELS[item.estado_anterior]}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#8A7F78]" aria-hidden="true" />
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap ${statusTone(item.estado_nuevo)}`}
                      >
                        {STATUS_LABELS[item.estado_nuevo]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#4B3024]">
                      {item.comentario || 'Sin comentario'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#8A7F78]">
                      <span className="font-extrabold text-[#4B3024]">{item.usuario_nombre}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-5 rounded-[18px] border border-dashed border-[#E8D8CC] bg-[#FFFCFA] p-6 text-center">
              <p className="text-sm font-extrabold text-[#4B3024]">Aun no hay cambios de estado registrados.</p>
              <p className="mt-1 text-xs font-semibold text-[#8A7F78]">
                Los movimientos de estado apareceran aqui conforme se actualicen.
              </p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
