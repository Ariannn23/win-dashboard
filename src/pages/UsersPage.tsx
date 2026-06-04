import { Clock3, Edit3, Power, PowerOff, Plus, Search, ShieldCheck, UserCog, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCrm } from '@/app/providers/CrmProvider';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { ROLE_LABELS } from '@/shared/lib/constants';
import { initials } from '@/shared/lib/format';
import { ComboBox } from '@/shared/ui/FormControls';
import { PageSkeleton } from '@/shared/ui/Skeleton';
import { useToast } from '@/shared/ui/Toast';
import { canManageUsers } from '@/shared/lib/permissions';
import type { Profile, Role } from '@/types';

export function UsersPage() {
  const { user } = useAuth();
  const { isLoading, profiles, upsertProfile, toggleProfile } = useCrm();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<Profile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role | 'TODOS'>('TODOS');
  const [status, setStatus] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');

  if (!user || !canManageUsers(user)) return <Navigate to="/dashboard" replace />;
  if (isLoading) return <PageSkeleton cards={3} tableRows={5} tableColumns={7} />;

  const filteredProfiles = useMemo(() => {
    const text = query.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesText =
        !text ||
        profile.nombres.toLowerCase().includes(text) ||
        profile.correo.toLowerCase().includes(text) ||
        profile.correo_recuperacion.toLowerCase().includes(text) ||
        ROLE_LABELS[profile.rol].toLowerCase().includes(text);
      const matchesRole = role === 'TODOS' || profile.rol === role;
      const matchesStatus =
        status === 'TODOS' ||
        (status === 'ACTIVO' && profile.activo) ||
        (status === 'INACTIVO' && !profile.activo);
      return matchesText && matchesRole && matchesStatus;
    });
  }, [profiles, query, role, status]);

  const admins = profiles.filter((profile) => profile.rol === 'ADMIN').length;
  const activeAdmins = profiles.filter((profile) => profile.rol === 'ADMIN' && profile.activo).length;
  const advisors = profiles.filter((profile) => profile.rol === 'ASESOR').length;

  const handleToggleProfile = (profile: Profile) => {
    if (profile.rol === 'ADMIN' && profile.activo && activeAdmins <= 1) {
      showToast({
        title: 'No se puede suspender',
        detail: 'Debe existir al menos un administrador activo en el sistema.',
        tone: 'warning',
      });
      return;
    }

    void toggleProfile(profile.id)
      .then(() => {
        showToast({
          title: profile.activo ? 'Usuario suspendido' : 'Usuario activado',
          detail: `${profile.nombres} fue ${profile.activo ? 'suspendido' : 'activado'} correctamente.`,
          tone: 'success',
        });
      })
      .catch((error) => {
        showToast({
          title: 'No se pudo cambiar el usuario',
          detail: error instanceof Error ? error.message : 'Intentalo nuevamente.',
          tone: 'error',
        });
      });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#1F1F1F]">Gestion de usuarios</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Administra los usuarios del sistema, sus roles, permisos y accesos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo usuario
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <UserSummary icon={ShieldCheck} value={admins} label="Administradores" />
        <UserSummary icon={UserCog} value={advisors} label="Asesores de venta" />
        <UserSummary icon={Clock3} value="34min" label="Ultima actividad media" />
      </section>

      <section className="overflow-hidden rounded-[20px] border border-[#EDE4DC] bg-white p-6 shadow-[0_14px_34px_rgba(91,47,20,0.055)]">
        <div className="grid gap-4 xl:grid-cols-[1fr_210px_210px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4B3024]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar usuario por nombre, correo o rol..."
              className="h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] pl-11 pr-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <ComboBox
            value={role}
            onChange={(value) => setRole(value as Role | 'TODOS')}
            options={[
              { value: 'TODOS', label: 'Todos los roles' },
              ...(Object.keys(ROLE_LABELS) as Role[]).map((item) => ({ value: item, label: ROLE_LABELS[item] })),
            ]}
          />
          <ComboBox
            value={status}
            onChange={(value) => setStatus(value as 'TODOS' | 'ACTIVO' | 'INACTIVO')}
            options={[
              { value: 'TODOS', label: 'Todos los estados' },
              { value: 'ACTIVO', label: 'Activos' },
              { value: 'INACTIVO', label: 'Suspendidos' },
            ]}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[1120px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E0BDAA] text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#4B3024]">
                <th className="px-1 py-4">Usuario</th>
                <th className="px-4 py-4">Rol</th>
                <th className="px-4 py-4">Correo electronico</th>
                <th className="px-4 py-4">Recuperacion</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Ultimo acceso</th>
                <th className="px-1 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4DC]">
              {filteredProfiles.map((profile, index) => (
                <tr key={profile.id} className="transition hover:bg-[#FFF8F3]">
                  <td className="px-1 py-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FFE2CC] text-xs font-extrabold text-[#C94A00]">
                        {initials(profile.nombres)}
                      </div>
                      <p className="font-extrabold text-[#1F1F1F]">{profile.nombres}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <RolePill role={profile.rol} />
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4B3024]">{profile.correo}</td>
                  <td className="px-4 py-4 font-semibold text-[#4B3024]">{profile.correo_recuperacion || 'Sin correo'}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${profile.activo ? 'bg-[#DDF8E9] text-[#2FA66A]' : 'bg-[#FFE8E8] text-[#D64545]'}`}>
                      {profile.activo ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#4B3024]">
                    {index < 4 ? '15/05/2026 9:18 AM' : '14/05/2026 5:30 PM'}
                  </td>
                  <td className="px-1 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(profile);
                          setShowForm(true);
                        }}
                        title="Editar usuario"
                        className="grid h-9 w-9 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleProfile(profile)}
                        title={profile.activo ? 'Suspender usuario' : 'Activar usuario'}
                        className="grid h-9 w-9 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
                      >
                        {profile.activo ? (
                          <PowerOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Power className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#E0BDAA] pt-5 text-sm font-semibold text-[#4B3024]">
          <p>Mostrando 1 a {filteredProfiles.length} de {profiles.length} usuarios</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className={`grid h-9 w-9 place-items-center rounded-[12px] border ${
                  page === 1
                    ? 'border-[#A83B00] bg-[#A83B00] text-white'
                    : 'border-[#E8D8CC] bg-white text-[#4B3024]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>

      {showForm && (
        <UserFormModal
          profile={editing}
          onClose={() => setShowForm(false)}
          onSubmit={async (values) => {
            try {
              await upsertProfile({ ...values, id: editing?.id });
              showToast({
                title: editing ? 'Usuario actualizado' : 'Usuario creado',
                detail: 'Los datos de acceso quedaron guardados.',
                tone: 'success',
              });
              setShowForm(false);
            } catch (error) {
              showToast({
                title: 'No se pudo guardar el usuario',
                detail: error instanceof Error ? error.message : 'Intentalo nuevamente.',
                tone: 'error',
              });
            }
          }}
        />
      )}
    </div>
  );
}

function RolePill({ role }: { role: Role }) {
  const styles = {
    ADMIN: 'bg-[#FFE2CC] text-[#C94A00]',
    BACK: 'bg-[#E9F4FF] text-[#2F80ED]',
    SUPERVISOR: 'bg-[#EAF3FF] text-[#005DE8]',
    ASESOR: 'bg-[#FFF1C7] text-[#B46A00]',
  } satisfies Record<Role, string>;

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${styles[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function UserSummary({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ShieldCheck;
  value: number | string;
  label: string;
}) {
  return (
    <article className="flex h-[92px] items-center gap-5 rounded-[20px] border border-[#EDE4DC] bg-[#FFF2E7] px-6">
      <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#C94A00]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[#1F1F1F]">{value}</p>
        <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#4B3024]">{label}</p>
      </div>
    </article>
  );
}
