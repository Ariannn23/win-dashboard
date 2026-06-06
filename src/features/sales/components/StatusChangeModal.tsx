import { AlertCircle, Calendar, CheckCircle2, Info, Wifi, X } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { FINAL_STATUSES, STATUS_LABELS, STATUS_ORDER } from '@/shared/lib/constants';
import { initials } from '@/shared/lib/format';
import { planBasePriceLabel } from '@/shared/lib/sales';
import { useAuth } from '@/app/providers/AuthProvider';
import { DateControl, FieldError } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { supabase } from '@/services/supabase/client';
import type { Role, Sale, StatusHistory, SaleStatus } from '@/types';

interface StatusChangeModalProps {
  sale: Sale;
  history?: StatusHistory[];
  onClose: () => void;
  onSubmit: (nextStatus: SaleStatus, comment: string) => void | Promise<void>;
}

interface StatusChangeErrors {
  status?: string;
  comment?: string;
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
  if (status === 'PROGRAMADO_GRABACION') return 'Agenda la grabacion con el cliente.';
  if (status === 'GRABADO') return 'Confirma que la grabacion fue completada.';
  if (status === 'PROGRAMADO_INSTALACION') return 'Agenda la instalacion del servicio.';
  if (status === 'INSTALADO') return 'Cierra la venta como completada.';
  if (status === 'RECHAZADO') return 'Marca la venta como no aprobada.';
  if (status === 'CANCELADO') return 'Detiene el flujo de la venta.';
  return currentStatus ? 'Siguiente paso del flujo.' : 'Cambio de estado.';
}

function nextAllowedStatuses(currentStatus: SaleStatus, role?: Role): SaleStatus[] {
  if (role === 'ASESOR' || role === 'SUPERVISOR') {
    if (currentStatus === 'RECHAZADO' || currentStatus === 'CANCELADO') return ['PENDIENTE_GRABACION'];
    return [];
  }

  if (currentStatus === 'PENDIENTE_GRABACION') return ['PROGRAMADO_GRABACION', 'GRABADO', 'RECHAZADO', 'CANCELADO'];
  if (currentStatus === 'PROGRAMADO_GRABACION') return ['GRABADO', 'RECHAZADO', 'CANCELADO'];
  if (currentStatus === 'GRABADO') return ['PROGRAMADO_INSTALACION', 'CANCELADO'];
  if (currentStatus === 'PROGRAMADO_INSTALACION') return ['INSTALADO', 'CANCELADO'];
  if (currentStatus === 'RECHAZADO' || currentStatus === 'CANCELADO') return ['PENDIENTE_GRABACION'];

  return [];
}



function requiresComment(status: SaleStatus) {
  return status === 'RECHAZADO' || status === 'CANCELADO';
}



export function StatusChangeModal({ sale, history = [], onClose, onSubmit }: StatusChangeModalProps) {
  const { user } = useAuth();
  const options = useMemo(() => {
    return nextAllowedStatuses(sale.estado, user?.rol);
  }, [sale.estado, user?.rol]);
  const [status, setStatus] = useState<SaleStatus>(options[0] ?? sale.estado);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<StatusChangeErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [planPrice, setPlanPrice] = useState('S/ 0.00');

  useEffect(() => {
    supabase
      ?.from('planes')
      .select('precio_mensual')
      .eq('nombre', sale.plan_contratar)
      .single()
      .then(({ data }) => {
        if (data) {
          setPlanPrice(`S/ ${data.precio_mensual.toFixed(2)}`);
        }
      });
  }, [sale.plan_contratar]);
  const isCompleting = status === 'INSTALADO';
  const today = new Date().toISOString().slice(0, 10);
  const selectedRequiresComment = requiresComment(status);

  const validate = () => {
    const nextErrors: StatusChangeErrors = {};

    if (!options.includes(status)) {
      nextErrors.status = 'Selecciona un estado valido para continuar.';
    }

    if (selectedRequiresComment && comment.trim().length < 10) {
      nextErrors.comment = 'Agrega un comentario de al menos 10 caracteres para cerrar el flujo.';
    }

    if (comment.trim().length > 300) {
      nextErrors.comment = 'El comentario no puede superar los 300 caracteres.';
    }


    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const auditComment = comment.trim() || `Cambio a ${STATUS_LABELS[status]}`;

    setSubmitting(true);
    try {
      await onSubmit(status, auditComment);
    } finally {
      setSubmitting(false);
    }
  };

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
                        Puedes avanzar solo al siguiente paso permitido o cerrar el flujo.
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
                        onSelect={() => {
                          setStatus(option);
                          setErrors((current) => ({ ...current, status: undefined }));
                        }}
                      />
                    ))}
                  </div>
                  <FieldError message={errors.status} />

                </section>

                <label className="block">
                  <span className="flex items-center justify-between text-sm font-semibold uppercase text-[#4B3024]">
                    Comentario de actualizacion
                    <span className="font-semibold text-[#8A7F78]">
                      {selectedRequiresComment ? 'Obligatorio' : 'Opcional'} · {comment.length}/300
                    </span>
                  </span>
                  <textarea
                    maxLength={300}
                    value={comment}
                    onChange={(event) => {
                      setComment(event.target.value);
                      setErrors((current) => ({ ...current, comment: undefined }));
                    }}
                    placeholder="Describe el motivo del cambio de estado..."
                    className="mt-3 min-h-[128px] w-full rounded-[15px] border border-[#E8D8CC] bg-white px-5 py-4 text-base font-semibold text-[#1F1F1F] outline-none transition placeholder:text-[#8A7F78] focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
                  />
                  <FieldError message={errors.comment} />
                </label>
                {history.length > 0 && (
                  <section className="border-t border-[#E8D8CC] pt-5">
                    <p className="mb-4 text-sm font-semibold uppercase text-[#4B3024]">Historial de actividad</p>
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[#FF7A1A]" />
                          <div>
                            <p className="font-semibold text-[#1F1F1F]">{'Cambio a ' + STATUS_LABELS[item.estado_nuevo]}</p>
                            {item.comentario && <p className="mt-0.5 text-[#6B625C]">{item.comentario}</p>}
                            <p className="mt-1 text-xs text-[#8A7F78]">{new Date(item.created_at).toLocaleString('es-PE')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[16px] border border-[#E8D8CC] bg-[#FFFCFA] p-5 text-sm font-semibold text-[#6B625C]">
                  Esta venta ya se encuentra en un estado final o no tienes permisos para cambiarlo.
                </div>
                {history.length > 0 && (
                  <section className="rounded-[20px] border border-[#E8D8CC] bg-white p-5">
                    <p className="mb-4 text-sm font-semibold uppercase text-[#4B3024]">Historial de actividad</p>
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 h-2 w-2 rounded-full bg-[#FF7A1A]" />
                          <div>
                            <p className="font-semibold text-[#1F1F1F]">{'Cambio a ' + STATUS_LABELS[item.estado_nuevo]}</p>
                            {item.comentario && <p className="mt-0.5 text-[#6B625C]">{item.comentario}</p>}
                            <p className="mt-1 text-xs text-[#8A7F78]">{new Date(item.created_at).toLocaleString('es-PE')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
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
            disabled={!options.length || submitting}
            onClick={handleSubmit}
            className="h-12 min-w-[220px] rounded-[15px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-6 text-sm font-semibold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-[#D8CCC4] disabled:shadow-none"
          >
            {submitting ? 'Guardando...' : 'Confirmar cambio'}
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
