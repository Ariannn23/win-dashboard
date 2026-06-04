import {
  BarChart3,
  Check,
  Eye,
  EyeOff,
  Grid2X2,
  Lock,
  Mail,
  TrendingUp,
  UserRound,
  UsersRound,
  Wifi,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import loginHero from '@/assets/login-hero.png';

export function LoginPage() {
  const { user, login } = useAuth();
  const [correo, setCorreo] = useState('admin@win.pe');
  const [password, setPassword] = useState('demo');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await login(correo, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF7F3] px-3 py-3 text-[#1F1F1F] sm:px-4 lg:px-5">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-[1360px] items-center rounded-[22px] border border-[#EDE4DC] bg-[radial-gradient(circle_at_28%_18%,#FFFDFC_0%,#FFF2E7_30%,#FAF7F3_72%)] p-4 shadow-[0_14px_44px_rgba(91,47,20,0.09)] lg:grid-cols-[1.08fr_0.92fr] lg:p-5 xl:p-6">
        <section className="relative hidden h-[min(650px,calc(100vh-72px))] min-h-[500px] overflow-hidden rounded-[20px] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_40%,rgba(255,122,26,0.22),transparent_36%)]" />
          <div className="relative z-10 max-w-xl">
            <div className="text-[clamp(38px,3.2vw,50px)] font-extrabold leading-none tracking-[-0.055em] text-[#E53900]">
              win
            </div>
            <h1 className="mt-5 text-[clamp(28px,2.45vw,36px)] font-extrabold leading-[1.14] tracking-[-0.025em] text-[#17202A]">
              Gestiona tus ventas.
              <span className="block">Conecta mas hogares.</span>
            </h1>
            <p className="mt-4 max-w-[390px] text-[clamp(15px,1.05vw,17px)] font-semibold leading-7 text-[#5E6673]">
              Plataforma moderna y centralizada para impulsar tu equipo y crecer tu negocio.
            </p>
          </div>

          <div className="absolute bottom-[68px] left-[-6%] h-[min(430px,54vh)] w-[108%]">
            <img
              src={loginHero}
              alt="Hogares conectados por fibra optica"
              className="h-full w-full object-contain object-bottom"
            />
          </div>

          <div className="absolute left-[16%] top-[47%] grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/85 text-[#F04405] shadow-soft backdrop-blur">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="absolute left-[43%] top-[41%] grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/85 text-[#F04405] shadow-soft backdrop-blur">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="absolute left-[33%] top-[55%] grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/85 text-[#F04405] shadow-soft backdrop-blur">
            <Check className="h-4 w-4" aria-hidden="true" />
          </div>

          <div className="absolute bottom-0 left-0 right-5 grid grid-cols-3 overflow-hidden rounded-[18px] border border-white/80 bg-white/82 shadow-[0_18px_45px_rgba(91,47,20,0.08)] backdrop-blur">
            <LoginBenefit
              icon={UsersRound}
              title="Mas clientes"
              text="Convierte mas oportunidades en conexiones reales."
            />
            <LoginBenefit
              icon={Grid2X2}
              title="Mas control"
              text="Administra tu gestion desde un solo lugar."
            />
            <LoginBenefit
              icon={TrendingUp}
              title="Mas crecimiento"
              text="Toma mejores decisiones con datos en tiempo real."
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[470px] rounded-[22px] border border-[#EDE4DC] bg-white/95 p-6 shadow-[0_18px_56px_rgba(91,47,20,0.09)] backdrop-blur sm:p-7 lg:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-5 text-[clamp(38px,3vw,48px)] font-extrabold leading-none tracking-[-0.06em] text-[#E53900]">
              win
            </div>
            <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#FFE2CC] text-[#C94A00] lg:hidden">
              <Wifi className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-[clamp(21px,1.5vw,24px)] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">
              Bienvenido de vuelta
            </h2>
            <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">Inicia sesion para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-extrabold text-[#1F1F1F]">Correo electronico</span>
              <span className="mt-2 flex h-[48px] items-center gap-3 rounded-[13px] border border-[#E8D8CC] bg-white px-4 text-[#8B827C] transition focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FFE2CC]/70">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <input
                  type="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  placeholder="Ingresa tu correo electronico"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-[#1F1F1F] outline-none placeholder:text-[#B7AAA2]"
                />
              </span>
            </label>
            <label className="block">
              <span className="text-xs font-extrabold text-[#1F1F1F]">Contrasena</span>
              <span className="mt-2 flex h-[48px] items-center gap-3 rounded-[13px] border border-[#E8D8CC] bg-white px-4 text-[#8B827C] transition focus-within:border-[#FF7A1A] focus-within:ring-4 focus-within:ring-[#FFE2CC]/70">
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contrasena"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-[#1F1F1F] outline-none placeholder:text-[#B7AAA2]"
                />
                <button
                  type="button"
                  title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[#8B827C] hover:bg-[#FFE2CC] hover:text-[#C94A00]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#6B625C]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded-md border-[#E8D8CC] accent-[#E85D04] focus:ring-[#FF7A1A]"
                />
                Recuerdame
              </label>
              <button type="button" className="text-left text-xs font-extrabold text-[#E53900] hover:text-[#C94A00]">
                Olvidaste tu contrasena?
              </button>
            </div>

            {error && (
              <p className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-[#D64545]">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex h-[50px] w-full items-center justify-center rounded-[13px] bg-gradient-to-r from-[#F24A00] via-[#E63E00] to-[#D93400] text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(216,52,0,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_28px_rgba(216,52,0,0.26)]"
            >
              Iniciar sesion
            </button>
          </form>

          <p className="mt-7 text-center text-xs font-bold text-[#8A7F78]">
            No tienes cuenta?{' '}
            <span className="font-extrabold text-[#E53900]">Contacta a un administrador</span>
          </p>
        </section>
      </div>
    </main>
  );
}

function LoginBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UsersRound;
  title: string;
  text: string;
}) {
  return (
    <article className="flex gap-3 border-r border-[#EDE4DC]/80 px-4 py-3.5 last:border-r-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#FFE2CC] text-[#E53900]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-xs font-extrabold text-[#1F1F1F]">{title}</h3>
        <p className="mt-1 text-[10px] font-semibold leading-4 text-[#6B625C]">{text}</p>
      </div>
    </article>
  );
}
