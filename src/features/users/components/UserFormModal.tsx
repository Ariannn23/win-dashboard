import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Camera, Copy, UserRound, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROLE_LABELS } from "@/shared/lib/constants";
import { ComboBox, DateControl, FieldError } from "@/shared/ui/FormControls";
import { Modal } from "@/shared/ui/Modal";
import { userSchema, type UserFormValues } from "@/shared/validation/schemas";
import type { Profile, Role } from "@/types";

interface UserFormModalProps {
  profile?: Profile | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
}

function toFormValues(profile?: Profile | null): UserFormValues {
  return {
    nombres: profile?.nombres ?? "",
    dni: profile?.dni ?? "",
    correo: profile?.correo?.replace(/@win\.pe$/i, "") ?? "",
    correo_recuperacion: profile?.correo_recuperacion ?? "",
    direccion: profile?.direccion ?? "",
    fecha_nacimiento: profile?.fecha_nacimiento ?? "",
    celular: profile?.celular ?? "",
    rol: profile?.rol ?? "ASESOR",
    activo: profile?.activo ?? true,
  };
}

export function UserFormModal({
  profile,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const { user } = useAuth();
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: toFormValues(profile),
  });

  const inputClass =
    "h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70";
  const selectedRole = watch("rol");
  const selectedActive = watch("activo");

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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="hidden-scrollbar min-h-0 flex-1 overflow-y-auto px-7 py-6"
      >
        <section>
          <div className="mb-2 mt-6 flex items-center justify-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[#FFF2E7] bg-gradient-to-br from-[#F24A00] to-[#C94A00] text-3xl font-extrabold text-white shadow-[0_10px_20px_rgba(201,74,0,0.22)]">
              {watch("nombres")
                ?.split(" ")
                .filter((n) => n.length > 0)
                .slice(0, 2)
                .map((n) => n[0].toUpperCase())
                .join("") || <UserRound className="h-10 w-10" aria-hidden="true" />}
            </div>
          </div>

          <div className="mt-7 grid gap-x-5 md:grid-cols-2 md:items-start">
            <div className="flex min-w-0 flex-col gap-2">
              <Field label="Nombre completo *" error={errors.nombres?.message}>
                <input
                  {...register("nombres", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    }
                  })}
                  placeholder="Ingresa el nombre completo"
                  className={inputClass}
                />
              </Field>
              <Field label="Correo corporativo *" error={errors.correo?.message}>
                <div className="flex h-12 overflow-hidden rounded-[14px] border border-[#E8D8CC] bg-white transition focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FFE2CC]/70">
                  <input
                    type="text"
                    {...register("correo", {
                      setValueAs: (value) => {
                        const text = String(value ?? "").trim().toLowerCase();
                        if (!text) return text;
                        return text.includes("@") ? text : `${text}@win.pe`;
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
              <Field label="Rol *">
                <ComboBox
                  value={selectedRole}
                  onChange={(value) =>
                    setValue("rol", value as Role, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={
                    user?.rol === "SUPERVISOR"
                      ? [{ value: "ASESOR", label: "Asesor de ventas" }]
                      : (Object.keys(ROLE_LABELS) as Role[]).map((role) => ({
                          value: role,
                          label: ROLE_LABELS[role],
                        }))
                  }
                />
              </Field>
              <Field label="Estado *">
                <ComboBox
                  value={String(selectedActive)}
                  onChange={(value) =>
                    setValue("activo", value === "true", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={[
                    { value: "true", label: "Activo" },
                    { value: "false", label: "Suspendido" },
                  ]}
                />
              </Field>
              <Field label="Celular *" error={errors.celular?.message}>
                <input
                  type="tel"
                  {...register("celular", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                    }
                  })}
                  placeholder="987654321"
                  className={inputClass}
                  maxLength={9}
                />
              </Field>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Field label="DNI" error={errors.dni?.message}>
                <input
                  {...register("dni", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                    }
                  })}
                  placeholder="Ingresa el DNI de 8 digitos"
                  className={inputClass}
                  maxLength={8}
                />
              </Field>
              <Field
                label="Correo de recuperacion *"
                error={errors.correo_recuperacion?.message}
              >
                <input
                  type="email"
                  {...register("correo_recuperacion")}
                  placeholder="correo.personal@gmail.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Dirección *" error={errors.direccion?.message}>
                <input
                  type="text"
                  {...register("direccion")}
                  placeholder="Ingresa la dirección"
                  className={inputClass}
                />
              </Field>
              <Field label="Fecha de Nacimiento *" error={errors.fecha_nacimiento?.message}>
                <input
                  type="text"
                  {...register("fecha_nacimiento", {
                    onChange: (e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                      if (val.length > 5) val = val.slice(0, 5) + "/" + val.slice(5);
                      e.target.value = val;
                    }
                  })}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className={inputClass}
                />
              </Field>
              
              {profile ? (
                <Field label="Contraseña *">
                  <div className="flex h-12 items-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-[#FFF2E7] px-4 text-xs italic text-[#8C2D00]">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Para cambiar contraseña, contacta a Desarrollo</span>
                  </div>
                </Field>
              ) : (
                <Field
                  label="Contraseña *"
                  error={errors.password?.message}
                >
                  <div className="flex h-12 overflow-hidden rounded-[14px] border border-[#E8D8CC] bg-white transition focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FFE2CC]/70">
                    <input
                      type="text"
                      {...register("password")}
                      placeholder="Min 8 caracteres, 1 letra, 1 num y 1 especial"
                      className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-semibold text-[#1F1F1F] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const pass = watch("password");
                        if (pass) navigator.clipboard.writeText(pass);
                      }}
                      title="Copiar contraseña"
                      className="grid place-items-center border-l border-[#E8D8CC] bg-[#FFF2E7] px-4 text-[#C94A00] hover:bg-[#FFE2CC]"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </Field>
              )}
            </div>
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
    <label className="relative block mb-8">
      <span className="mb-2 block text-xs font-extrabold text-[#4B3024]">{label}</span>
      {children}
      <div className="absolute left-0 top-full w-full pt-1.5">
        <FieldError message={error} />
      </div>
    </label>
  );
}
