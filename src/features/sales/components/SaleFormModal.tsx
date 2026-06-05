import { zodResolver } from '@hookform/resolvers/zod';
import {
  Banknote,
  BriefcaseBusiness,
  FileText,
  Headphones,
  MapPin,
  Plus,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { DISTRICTS, PLAN_OPTIONS } from '@/shared/lib/constants';
import { initials } from '@/shared/lib/format';
import { planBasePriceLabel } from '@/shared/lib/sales';
import { ComboBox, DateControl, FieldError } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { saleSchema, type SaleFormValues } from '@/shared/validation/schemas';
import type { Profile, Sale } from '@/types';
import { planService, type Plan } from '@/services/crm/planService';
import { useEffect, useState } from 'react';
import { FileField } from './FileField';

interface SaleFormModalProps {
  sale?: Sale | null;
  profiles: Profile[];
  currentUser: Profile;
  onClose: () => void;
  onSubmit: (values: SaleFormValues) => void | Promise<void>;
}

const blankValues: SaleFormValues = {
  asesor_id: '',
  supervisor_id: '',
  nombres_cliente: '',
  tipo_documento: 'DNI',
  numero_documento: '',
  fecha_nacimiento: '',
  lugar_nacimiento: '',
  correo_cliente: '',
  celular_principal: '',
  celular_referencia: '',
  titular_linea: '',
  direccion: '',
  coordenadas: '',
  tipo_vivienda: 'Casa',
  distrito: '',
  referencia: '',
  plan_contratar: '350 MBPS + FONOWIN',
  mesh: 0,
  win_box: 0,
  observaciones: '',
  observaciones_back: '',
  foto_dni: '',
  foto_recibo: '',
  foto_selfie: '',
};

function toFormValues(sale: Sale): SaleFormValues {
  return {
    asesor_id: sale.asesor_id,
    supervisor_id: sale.supervisor_id,
    nombres_cliente: sale.nombres_cliente,
    tipo_documento: sale.tipo_documento,
    numero_documento: sale.numero_documento,
    fecha_nacimiento: sale.fecha_nacimiento,
    lugar_nacimiento: sale.lugar_nacimiento,
    correo_cliente: sale.correo_cliente,
    celular_principal: sale.celular_principal,
    celular_referencia: sale.celular_referencia,
    titular_linea: sale.titular_linea,
    direccion: sale.direccion,
    coordenadas: sale.coordenadas,
    tipo_vivienda: sale.tipo_vivienda,
    distrito: sale.distrito,
    referencia: sale.referencia,
    plan_contratar: sale.plan_contratar,
    mesh: sale.mesh,
    win_box: sale.win_box,
    observaciones: sale.observaciones ?? '',
    observaciones_back: sale.observaciones_back ?? '',
    foto_dni: sale.foto_dni ?? '',
    foto_recibo: sale.foto_recibo ?? '',
    foto_selfie: sale.foto_selfie ?? '',
  };
}

export function SaleFormModal({ sale, profiles, currentUser, onClose, onSubmit }: SaleFormModalProps) {
  const advisors = profiles.filter((profile) => profile.rol === 'ASESOR' && profile.activo);
  const supervisors = profiles.filter((profile) => profile.rol === 'SUPERVISOR' && profile.activo);
  const draftId = useMemo(() => sale?.id ?? crypto.randomUUID(), [sale?.id]);
  const isAdvisorFlow = currentUser.rol === 'ASESOR';
  const isSupervisorFlow = currentUser.rol === 'SUPERVISOR';
  const canEditBackOffice = currentUser.rol === 'ADMIN' || currentUser.rol === 'BACK';

  const [planes, setPlanes] = useState<Plan[]>([]);
  
  useEffect(() => {
    planService.getPlans().then(setPlanes).catch(console.error);
  }, []);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale
      ? toFormValues(sale)
      : {
          ...blankValues,
          asesor_id: currentUser.rol === 'ASESOR' ? currentUser.id : '',
          supervisor_id: currentUser.rol === 'SUPERVISOR' ? currentUser.id : '',
        },
  });

  const watchedClient = useWatch({
    control,
    name: ['nombres_cliente', 'correo_cliente', 'celular_principal', 'tipo_documento', 'numero_documento', 'plan_contratar'],
  });

  const [clientName, clientEmail, clientPhone, docType, docNumber, selectedPlan] = watchedClient;
  const planPrice = planBasePriceLabel(selectedPlan || '');

  const inputClass =
    'mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70';
  const areaClass =
    'mt-2 min-h-24 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 py-3 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70';

  return (
    <Modal
      open
      onClose={onClose}
      className="relative my-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-[980px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)] sm:h-[calc(100dvh-3rem)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-5 py-5 sm:px-8 sm:py-6">
        <h2 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">
          {sale ? 'Editar venta' : 'Registrar venta'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          title="Cerrar"
          className="grid h-10 w-10 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7]"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="hidden-scrollbar flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="hidden-scrollbar min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
            <section>
              <div className="rounded-[20px] border border-[#E8B9A3] bg-[#FFF2E7] p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-white bg-[#FFD8CA] text-lg font-extrabold text-[#8C2D00] shadow-sm">
                      {clientName ? initials(clientName) : 'CL'}
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#1F1F1F]">{clientName || 'Nombre del cliente'}</p>
                      <p className="mt-1 text-sm font-semibold text-[#6B625C]">{clientEmail || 'correo@cliente.com'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-[#4B3024]">
                    <span>{clientPhone || 'Celular'}</span>
                    <span className="text-[#8A7F78]">•</span>
                    <span>
                      {docType}. {docNumber || 'Documento'}
                    </span>
                    <span className="rounded-full bg-[#FFF1C7] px-4 py-2 text-xs font-extrabold text-[#B46A00]">
                      Pendiente de grabacion
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-7 lg:grid-cols-2">
              <div className="space-y-5">
                <SectionTitle icon={UserRound} title="Datos del cliente" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombres y apellidos" error={errors.nombres_cliente?.message}>
                    <input {...register('nombres_cliente')} className={inputClass} />
                  </Field>
                  <Field label="Correo electronico" error={errors.correo_cliente?.message}>
                    <input type="email" {...register('correo_cliente')} className={inputClass} />
                  </Field>
                  <Field label="Tipo documento" error={errors.tipo_documento?.message}>
                    <Controller
                      name="tipo_documento"
                      control={control}
                      render={({ field }) => (
                        <ComboBox
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: 'DNI', label: 'DNI' },
                            { value: 'CE', label: 'CE' },
                            { value: 'PASAPORTE', label: 'Pasaporte' },
                          ]}
                        />
                      )}
                    />
                  </Field>
                  <Field label="Numero documento" error={errors.numero_documento?.message}>
                    <input {...register('numero_documento')} className={inputClass} />
                  </Field>
                  <Field label="Fecha nacimiento" error={errors.fecha_nacimiento?.message}>
                    <Controller
                      name="fecha_nacimiento"
                      control={control}
                      render={({ field }) => <DateControl value={field.value} onChange={field.onChange} />}
                    />
                  </Field>
                  <Field label="Lugar nacimiento" error={errors.lugar_nacimiento?.message}>
                    <input {...register('lugar_nacimiento')} className={inputClass} />
                  </Field>
                  <Field label="Celular principal" error={errors.celular_principal?.message}>
                    <input {...register('celular_principal')} className={inputClass} />
                  </Field>
                  <Field label="Celular referencia" error={errors.celular_referencia?.message}>
                    <input {...register('celular_referencia')} className={inputClass} />
                  </Field>
                  <Field label="Titular de linea" error={errors.titular_linea?.message}>
                    <input {...register('titular_linea')} className={inputClass} />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle icon={BriefcaseBusiness} title="Servicio y plan" />
                <div className="grid gap-4">
                  <Field label="Servicio" error={errors.plan_contratar?.message}>
                    <Controller
                      name="plan_contratar"
                      control={control}
                      render={({ field }) => (
                        <ComboBox
                          value={field.value}
                          onChange={field.onChange}
                          options={planes.filter(p => p.activo || p.nombre === field.value).map((plan) => ({ value: plan.nombre, label: plan.nombre }))}
                        />
                      )}
                    />
                  </Field>
                  <div className="rounded-[16px] border border-[#E8D8CC] bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-[#1F1F1F]">{selectedPlan || 'Plan seleccionado'}</p>
                        <p className="mt-1 text-sm font-semibold text-[#A83B00]">{planPrice} / mes</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Cantidad Mesh" error={errors.mesh?.message}>
                      <input type="number" min={0} {...register('mesh')} className={inputClass} />
                    </Field>
                    <Field label="Cantidad WinBox" error={errors.win_box?.message}>
                      <input type="number" min={0} {...register('win_box')} className={inputClass} />
                    </Field>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-7 lg:grid-cols-2">
              <div className="space-y-5">
                <SectionTitle icon={UsersRound} title="Equipo comercial" />
                <div className="grid gap-4">
                  {isAdvisorFlow && (
                    <input type="hidden" {...register('asesor_id')} value={currentUser.id} />
                  )}
                  {isSupervisorFlow ? (
                    <>
                      <input type="hidden" {...register('supervisor_id')} value={currentUser.id} />
                      <AssignedUserCard label="Supervisor" user={currentUser} detail="Asignado automaticamente" />
                    </>
                  ) : (
                    <Field label="Supervisor" error={errors.supervisor_id?.message}>
                      <Controller
                        name="supervisor_id"
                        control={control}
                        render={({ field }) => (
                          <ComboBox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Seleccionar"
                            options={[
                              { value: '', label: 'Seleccionar' },
                              ...supervisors.map((supervisor) => ({ value: supervisor.id, label: supervisor.nombres })),
                            ]}
                          />
                        )}
                      />
                    </Field>
                  )}
                  {isAdvisorFlow ? (
                    <AssignedUserCard label="Asesor responsable" user={currentUser} detail="Asignado automaticamente" />
                  ) : (
                    <Field label="Asesor" error={errors.asesor_id?.message}>
                      <Controller
                        name="asesor_id"
                        control={control}
                        render={({ field }) => (
                          <ComboBox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Seleccionar"
                            options={[
                              { value: '', label: 'Seleccionar' },
                              ...advisors.map((advisor) => ({ value: advisor.id, label: advisor.nombres })),
                            ]}
                          />
                        )}
                      />
                    </Field>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <SectionTitle icon={Banknote} title="Monto" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Monto mensual">
                    <input readOnly value={planPrice} className={inputClass} />
                  </Field>
                  <Field label="Frecuencia">
                    <ComboBox value="Mensual" onChange={() => undefined} options={[{ value: 'Mensual', label: 'Mensual' }, { value: 'Anual', label: 'Anual' }]} />
                  </Field>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <SectionTitle icon={MapPin} title="Direccion e instalacion" />
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Direccion completa" error={errors.direccion?.message}>
                  <input {...register('direccion')} className={inputClass} />
                </Field>
                <Field label="Coordenadas" error={errors.coordenadas?.message}>
                  <input {...register('coordenadas')} placeholder="-8.111763, -79.028686" className={inputClass} />
                </Field>
                <Field label="Distrito" error={errors.distrito?.message}>
                  <Controller
                    name="distrito"
                    control={control}
                    render={({ field }) => (
                      <ComboBox
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleccionar"
                        options={[{ value: '', label: 'Seleccionar' }, ...DISTRICTS.map((district) => ({ value: district, label: district }))]}
                      />
                    )}
                  />
                </Field>
                <Field label="Tipo vivienda" error={errors.tipo_vivienda?.message}>
                  <Controller
                    name="tipo_vivienda"
                    control={control}
                    render={({ field }) => (
                      <ComboBox
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'Casa', label: 'Casa' },
                          { value: 'Multifamiliar', label: 'Multifamiliar' },
                        ]}
                      />
                    )}
                  />
                </Field>
                <Field label="Referencia" error={errors.referencia?.message}>
                  <input {...register('referencia')} className={inputClass} />
                </Field>
              </div>
            </section>

            <section className="space-y-5">
              <SectionTitle icon={FileText} title="Documentos" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Controller
                  name="foto_dni"
                  control={control}
                  render={({ field }) => (
                    <FileField label="Foto DNI" kind="dni" saleId={draftId} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="foto_recibo"
                  control={control}
                  render={({ field }) => (
                    <FileField label="Foto Recibo" kind="recibo" saleId={draftId} value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  name="foto_selfie"
                  control={control}
                  render={({ field }) => (
                    <FileField label="Foto Selfie" kind="selfie" saleId={draftId} value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </section>

            <section className={`grid gap-4 ${canEditBackOffice ? 'md:grid-cols-2' : ''}`}>
              <div>
                <SectionTitle icon={Headphones} title="Observaciones" />
                <Field label="Observaciones" error={errors.observaciones?.message}>
                  <textarea {...register('observaciones')} className={areaClass} />
                </Field>
              </div>
              {canEditBackOffice ? (
                <div>
                  <SectionTitle icon={FileText} title="Back office" />
                  <Field label="Observaciones internas" error={errors.observaciones_back?.message}>
                    <textarea {...register('observaciones_back')} className={areaClass} />
                  </Field>
                </div>
              ) : (
                <input type="hidden" {...register('observaciones_back')} value="" />
              )}
            </section>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#E8D8CC] bg-[#FFFCFA] px-5 py-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
            <button
              type="button"
              onClick={onClose}
              className="h-12 w-full rounded-[15px] border border-[#E8B9A3] bg-white px-6 text-sm font-extrabold text-[#1F1F1F] hover:bg-[#FFF2E7] sm:w-auto sm:min-w-[180px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-12 w-full rounded-[15px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-6 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)] sm:w-auto sm:min-w-[220px]"
            >
              {sale ? 'Guardar cambios' : 'Registrar venta'}
            </button>
          </div>
      </form>
    </Modal>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3 text-[#A32800]">
      <Icon className="h-5 w-5" aria-hidden="true" />
      <h3 className="text-xl font-extrabold tracking-[-0.02em]">{title}</h3>
    </div>
  );
}

function AssignedUserCard({ label, user, detail }: { label: string; user: Profile; detail: string }) {
  return (
    <div className="rounded-[16px] border border-[#E8D8CC] bg-white px-4 py-3">
      <p className="text-sm font-semibold text-[#4B3024]">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FFE2CC] text-[11px] font-extrabold text-[#C94A00]">
          {initials(user.nombres)}
        </span>
        <div>
          <p className="text-sm font-extrabold text-[#1F1F1F]">{user.nombres}</p>
          <p className="text-xs font-semibold text-[#8A7F78]">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#4B3024]">{label}</span>
      {children}
      <FieldError message={error} />
    </label>
  );
}
