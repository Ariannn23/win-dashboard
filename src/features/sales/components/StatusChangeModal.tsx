import { AlertCircle, Calendar, CheckCircle2, Info, Wifi, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FINAL_STATUSES, STATUS_LABELS, STATUS_ORDER } from '@/shared/lib/constants';
import { initials } from '@/shared/lib/format';
import { planBasePriceLabel } from '@/shared/lib/sales';
import { DateControl } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import type { Sale, SaleStatus } from '@/types';

interface StatusChangeModalProps {
  sale: Sale;
  onClose: () => void;
  onSubmit: (nextStatus: SaleStatus, comment: string) => void | Promise<void>;
}

function simpleStatus(status: SaleStatus) {
  return STATUS_LABELS[status];
}

function statusTone(status: SaleStatus) {
  if (status === 'INSTALADO') return 'bg-[#DDF8E9] text-[#2FA66A]';
  if (status === 'RECHAZADO') return 'bg-[#FFE8E8] text-[#D64545]';
  if (status === 'CANCELADO') return 'bg-[#F3EAE3] text-[#6B625C]';
  return 'bg-[#FFE2CC] text-[#A83B00]';
}

function statusDescription(status: SaleStatus, currentStatus: SaleStatus) {
  if (status === 'INSTALADO') return 'Cierra la venta como completada.';
  if (status === 'RECHAZADO') return 'Marca la venta como no aprobada.';
  if (status === 'CANCELADO') return 'Detiene el flujo de la venta.';

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextIndex = STATUS_ORDER.indexOf(status);
  if (currentIndex >= 0 && nextIndex === currentIndex + 1) return 'Siguiente paso recomendado.';
  return 'Avanza saltando pasos intermedios.';
}

export function StatusChangeModal({ sale, onClose, onSubmit }: StatusChangeModalProps) {
  const options = useMemo(() => {
    if (FINAL_STATUSES.includes(sale.estado)) return [];
    const currentIndex = STATUS_ORDER.indexOf(sale.estado);
    const nextFlow = currentIndex >= 0 ? STATUS_ORDER.slice(currentIndex + 1) : [];
    return [...nextFlow, 'RECHAZADO', 'CANCELADO'].filter(Boolean) as SaleStatus[];
  }, [sale.estado]);
  const [status, setStatus] = useState<SaleStatus>(options[0] ?? sale.estado);
  const [comment, setComment] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const planPrice = planBasePriceLabel(sale.plan_contratar);
  const currentFlowIndex = STATUS_ORDER.indexOf(sale.estado);
  const targetFlowIndex = STATUS_ORDER.indexOf(status);
  const isCompleting = status === 'INSTALADO';
  const isSkippingFlow = currentFlowIndex >= 0 && targetFlowIndex > currentFlowIndex + 1;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal
      open
      onClose={onClose}
      className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-8 py-6">
        <h2 className="text-xl font-semibold text-[#1F1F1F]">Cambiar estado de venta</h2>
        <button
          type="button"
          onClick={onClose}
          title="Cerrar"
          className="grid h-10 w-10 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7]"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="hidden-scrollbar min-h-0 flex-1 overflow-y-auto px-8 py-7">
          <section className="rounded-[20px] border border-[#E8B9A3] bg-[#FFF2E7] p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-white bg-[#FFD8CA] text-lg font-extrabold text-[#8C2D00] shadow-sm">
                  {initials(sale.nombres_cliente)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1F1F1F]">{sale.nombres_cliente}</p>
                  <p className="mt-1 text-sm font-semibold text-[#4B3024]">ID: VT-{new Date(sale.created_at).getFullYear()}-{sale.numero_documento.slice(-5)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-5 text-sm font-semibold text-[#4B3024]">
                    <span className="inline-flex items-center gap-2">
                      <Wifi className="h-4 w-4" aria-hidden="true" />
                      {sale.plan_contratar}
                    </span>
                    <span className="font-extrabold text-[#A83B00]">{planPrice} / mes</span>
                  </div>
                </div>
              </div>
              <span className={`w-fit rounded-full px-4 py-2 text-sm font-extrabold ${statusTone(sale.estado)}`}>
                {simpleStatus(sale.estado)}
              </span>
            </div>
          </section>

          <div className="mt-7 space-y-7">
            <section>
              <p className="text-sm font-semibold uppercase text-[#4B3024]">Estado actual</p>
              <span className={`mt-3 inline-flex items-center gap-3 rounded-[14px] px-5 py-3 text-base font-semibold ${statusTone(sale.estado)}`}>
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                {simpleStatus(sale.estado)}
              </span>
            </section>

            {options.length ? (
              <>
                <section>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <span className="text-sm font-semibold uppercase text-[#4B3024]">Seleccionar nuevo estado</span>
                      <p className="mt-1 text-sm font-semibold text-[#8A6B5A]">
                        Puedes avanzar al siguiente paso o cerrar el flujo como instalado.
                      </p>
                    </div>
                    {isCompleting && (
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#DDF8E9] px-3 py-1 text-xs font-extrabold text-[#2FA66A]">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Flujo completado
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {options.map((option) => (
                      <StatusOption
                        key={option}
                        status={option}
                        active={status === option}
                        currentStatus={sale.estado}
                        onSelect={() => setStatus(option)}
                      />
                    ))}
                  </div>

                  {isSkippingFlow && (
                    <div className="mt-3 rounded-[14px] border border-[#FFE1A8] bg-[#FFF8E6] px-4 py-3 text-sm font-semibold text-[#8A5B00]">
                      Este cambio saltara pasos intermedios del flujo. Usa un comentario para dejar claro el motivo.
                    </div>
                  )}
                </section>

                <label className="block">
                  <span className="flex items-center justify-between text-sm font-semibold uppercase text-[#4B3024]">
                    Comentario de actualizacion
                    <span className="font-semibold text-[#8A7F78]">{comment.length}/300</span>
                  </span>
                  <textarea
                    maxLength={300}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Describe el motivo del cambio de estado..."
                    className="mt-3 min-h-[128px] w-full rounded-[15px] border border-[#E8D8CC] bg-white px-5 py-4 text-base font-semibold text-[#1F1F1F] outline-none transition placeholder:text-[#8A7F78] focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold uppercase text-[#4B3024]">Fecha de proximo seguimiento</span>
                  <div className="mt-3 overflow-hidden rounded-[16px] border border-[#E8D8CC] bg-white transition focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FFE2CC]/70">
                    <div className="flex items-center gap-4 px-5 py-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#FFF2E7] text-[#C94A00]">
                        <Calendar className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">
                          {followUpDate ? 'Fecha seleccionada' : 'Sin fecha seleccionada'}
                        </p>
                        <div className="mt-2">
                          <DateControl value={followUpDate} onChange={setFollowUpDate} min={today} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#8A6B5A]">
                    <Info className="h-4 w-4" aria-hidden="true" />
                    Se generara una tarea automatica en el calendario del asesor.
                  </p>
                </label>

                <section className="border-t border-[#E8D8CC] pt-5">
                  <p className="text-sm font-semibold uppercase text-[#4B3024]">Historial de actividad</p>
                </section>
              </>
            ) : (
              <div className="rounded-[16px] border border-[#E8D8CC] bg-[#FFFCFA] p-5 text-sm font-semibold text-[#6B625C]">
                Esta venta ya se encuentra en un estado final.
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-4 border-t border-[#E8D8CC] bg-[#FFFCFA] px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-12 min-w-[170px] rounded-[15px] border border-[#E8B9A3] bg-white px-6 text-sm font-semibold text-[#1F1F1F] hover:bg-[#FFF2E7]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!options.length}
            onClick={() => onSubmit(status, comment)}
            className="h-12 min-w-[220px] rounded-[15px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-6 text-sm font-semibold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#D8CCC4] disabled:shadow-none"
          >
            Confirmar cambio
          </button>
        </div>
    </Modal>
  );
}

function StatusOption({
  status,
  active,
  currentStatus,
  onSelect,
}: {
  status: SaleStatus;
  active: boolean;
  currentStatus: SaleStatus;
  onSelect: () => void;
}) {
  const isTerminal = FINAL_STATUSES.includes(status);
  const tone = statusTone(status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex min-h-[86px] items-start gap-3 rounded-[16px] border p-4 text-left transition ${
        active
          ? 'border-[#C94A00] bg-[#FFF2E7] shadow-[0_14px_24px_rgba(201,74,0,0.12)] ring-1 ring-[#C94A00]/20'
          : 'border-[#E8D8CC] bg-white hover:border-[#FFB48A] hover:bg-[#FFFCFA]'
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          active ? 'border-[#C94A00] bg-[#C94A00]' : 'border-[#D8CCC4] bg-white'
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${tone}`}>
            {STATUS_LABELS[status]}
          </span>
          {isTerminal && (
            <span className="rounded-full bg-[#F3EAE3] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6B625C]">
              Final
            </span>
          )}
        </span>
        <span className="mt-2 block text-xs font-semibold leading-5 text-[#6B625C]">
          {statusDescription(status, currentStatus)}
        </span>
      </span>
    </button>
  );
}
