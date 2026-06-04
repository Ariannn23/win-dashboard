import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, UserRound, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ROLE_LABELS } from '@/shared/lib/constants';
import { ComboBox, FieldError } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { userSchema, type UserFormValues } from '@/shared/validation/schemas';
import type { Profile, Role } from '@/types';

interface UserFormModalProps {
  profile?: Profile | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

function toFormValues(profile?: Profile | null): UserFormValues {
  return {
    nombres: profile?.nombres ?? '',
    correo: profile?.correo?.replace(/@win\.pe$/i, '') ?? '',
    correo_recuperacion: profile?.correo_recuperacion ?? '',
    rol: profile?.rol ?? 'ASESOR',
    activo: profile?.activo ?? true,
  };
}

export function UserFormModal({ profile, onClose, onSubmit }: UserFormModalProps) {
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: toFormValues(profile),
  });

  const inputClass =
    'mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70';
  const selectedRole = watch('rol');
  const selectedActive = watch('activo');

  return (
    <Modal
      open
      onClose={onClose}
      className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.22)]"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-7 py-5">
        <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#1F1F1F]">
          Crear / Editar usuario
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

      <form onSubmit={handleSubmit(onSubmit)} className="hidden-scrollbar min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <section>
            <h3 className="text-sm font-semibold text-[#4B3024]">Informacion basica</h3>

            <div className="mt-6 text-center">
              <p className="mb-3 text-left text-xs font-extrabold text-[#4B3024]">Foto de perfil</p>
              <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-[#A77A64] bg-[#FFF2E7] text-[#CDA997]">
                <UserRound className="h-8 w-8" aria-hidden="true" />
                <button
                  type="button"
                  title="Subir foto"
                  className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-[#C94A00] text-white shadow-[0_10px_18px_rgba(201,74,0,0.22)]"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#8A7F78]">JPG, PNG o WEBP. Max 2MB</p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <Field label="Nombre completo *" error={errors.nombres?.message}>
                <input {...register('nombres')} placeholder="Ingresa el nombre completo" className={inputClass} />
              </Field>
              <Field label="Correo corporativo *" error={errors.correo?.message}>
                <div className="mt-2 flex h-12 overflow-hidden rounded-[14px] border border-[#E8D8CC] bg-white transition focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FFE2CC]/70">
                  <input
                    type="text"
                    {...register('correo', {
                      setValueAs: (value) => {
                        const text = String(value ?? '').trim().toLowerCase();
                        if (!text) return text;
                        return text.includes('@') ? text : `${text}@win.pe`;
                      },
                    })}
                    placeholder="usuario"
                    className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-semibold text-[#1F1F1F] outline-none"
                  />
                  <span className="grid place-items-center border-l border-[#E8D8CC] bg-[#FFF2E7] px-4 text-sm font-extrabold text-[#C94A00]">
                    @win.pe
                  </span>
                </div>
              </Field>
              <Field label="Correo de recuperacion *" error={errors.correo_recuperacion?.message}>
                <input
                  type="email"
                  {...register('correo_recuperacion')}
                  placeholder="correo.personal@gmail.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Rol *">
                <ComboBox
                  value={selectedRole}
                  onChange={(value) => setValue('rol', value as Role, { shouldDirty: true, shouldValidate: true })}
                  options={(Object.keys(ROLE_LABELS) as Role[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
                />
              </Field>
              <Field label="Supervisor asignado">
                <ComboBox value="" onChange={() => undefined} options={[{ value: '', label: 'Selecciona un supervisor' }]} />
              </Field>
              <Field label="Estado *">
                <ComboBox
                  value={String(selectedActive)}
                  onChange={(value) => setValue('activo', value === 'true', { shouldDirty: true, shouldValidate: true })}
                  options={[
                    { value: 'true', label: 'Activo' },
                    { value: 'false', label: 'Suspendido' },
                  ]}
                />
              </Field>
            </div>
          </section>

          <section className="mt-9">
            <h3 className="text-sm font-semibold text-[#4B3024]">Acceso al sistema</h3>
            <div className="mt-5 space-y-5">
              <label className="flex cursor-pointer gap-4">
                <input type="radio" name="access" defaultChecked className="mt-1 h-4 w-4 accent-[#C94A00]" />
                <span>
                  <span className="block text-sm font-extrabold text-[#1F1F1F]">Enviar contrasena de acceso</span>
                  <span className="mt-1 block text-xs font-semibold text-[#6B625C]">
                    Se enviara un correo con la contrasena temporal.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-4">
                <input type="radio" name="access" className="mt-1 h-4 w-4 accent-[#C94A00]" />
                <span>
                  <span className="block text-sm font-extrabold text-[#1F1F1F]">Establecer contrasena manual</span>
                  <span className="mt-1 block text-xs font-semibold text-[#6B625C]">
                    Define una contrasena para el usuario.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="mt-9 border-t border-[#E8D8CC] pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#4B3024]">Permisos del usuario</h3>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6B625C]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#E8D8CC] accent-[#C94A00]" />
                Seleccionar todo
              </label>
            </div>
          </section>
        </form>

        <div className="flex shrink-0 justify-end gap-4 border-t border-[#E8D8CC] bg-[#FFFCFA] px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-12 min-w-[180px] rounded-[15px] border border-[#E8B9A3] bg-white px-6 text-sm font-extrabold text-[#1F1F1F] hover:bg-[#FFF2E7]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="h-12 min-w-[200px] rounded-[15px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-6 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
          >
            Guardar usuario
          </button>
        </div>
    </Modal>
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
      <span className="text-xs font-extrabold text-[#4B3024]">{label}</span>
      {children}
      <FieldError message={error} />
    </label>
  );
}
