import { useState, useEffect, useMemo } from 'react';
import { planService, type Plan, type PlanInsert } from '@/services/crm/planService';
import { useCrm } from '@/app/providers/CrmProvider';
import {
  CheckCircle2,
  Edit3,
  Eraser,
  Plus,
  Power,
  Search,
  ShieldCheck,
  UsersRound,
  Wifi,
  X,
} from 'lucide-react';
import { formatMoney } from '@/shared/lib/format';
import { ComboBox } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { PageSkeleton } from '@/shared/ui/Skeleton';

export function PlansPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { sales } = useCrm();

  useEffect(() => {
    loadPlanes(true);
  }, []);

  async function loadPlanes(showLoading = false) {
    if (showLoading) setIsLoading(true);
    try {
      const data = await planService.getPlans();
      setPlanes(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }

  const filteredPlans = useMemo(() => {
    const text = query.trim().toLowerCase();
    return planes.filter((plan) => {
      const matchesText = !text || plan.nombre.toLowerCase().includes(text);
      const matchesStatus =
        status === 'TODOS' ||
        (status === 'ACTIVO' && plan.activo) ||
        (status === 'INACTIVO' && !plan.activo);
      return matchesText && matchesStatus;
    });
  }, [planes, query, status]);

  const activePlans = planes.filter((p) => p.activo).length;

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setPlanes(current => current.map(p => p.id === id ? { ...p, activo: !currentStatus } : p));
    try {
      await planService.togglePlan(id, !currentStatus);
      loadPlanes(false);
    } catch (error) {
      console.error(error);
      // Revert if failed
      setPlanes(current => current.map(p => p.id === id ? { ...p, activo: currentStatus } : p));
    }
  };

  if (isLoading) return <PageSkeleton cards={4} tableRows={6} tableColumns={5} />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Planes</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Gestiona planes disponibles, precios y beneficios comerciales.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPlan(null);
            setShowModal(true);
          }}
          className="fixed bottom-[84px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#F24A00] to-[#C94A00] text-white shadow-[0_14px_30px_rgba(201,74,0,0.4)] transition-transform hover:scale-105 active:scale-95 xl:static xl:h-11 xl:w-auto xl:rounded-[14px] xl:px-5 xl:shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
        >
          <Plus className="h-6 w-6 xl:mr-2 xl:h-4 xl:w-4" aria-hidden="true" />
          <span className="hidden xl:inline">Nuevo plan</span>
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PlanMetric icon={Wifi} label="Planes activos" value={activePlans} detail="Disponibles para venta" tone="orange" />
        <PlanMetric icon={ShieldCheck} label="Plan mas vendido" value={planes[0]?.nombre || '-'} detail="-" tone="amber" />
        <PlanMetric icon={CheckCircle2} label="Ingresos estimados" value="S/ 0" detail="Mensual proyectado" tone="green" />
        <PlanMetric icon={UsersRound} label="Clientes activos" value="0" detail="Con plan habilitado" tone="blue" />
      </section>

      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7F78]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar plan por nombre..."
              className="h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] pl-11 pr-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <ComboBox
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { value: 'TODOS', label: 'Todos los estados' },
              { value: 'ACTIVO', label: 'Activos' },
              { value: 'INACTIVO', label: 'Deshabilitados' },
            ]}
          />
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatus('TODOS');
            }}
            className="flex h-12 items-center gap-2 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] hover:bg-[#FFF2E7] hover:text-[#A83B00]"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            Limpiar
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredPlans.map((plan) => {
          const planClients = sales.filter(s => s.plan_contratar === plan.nombre && s.estado === 'INSTALADO').length;
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              clients={planClients}
              onEdit={() => {
                setEditingPlan(plan);
                setShowModal(true);
              }}
              onToggle={() => handleToggle(plan.id, plan.activo)}
            />
          );
        })}
      </section>

      {showModal && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
          onSubmit={async (values) => {
            if (editingPlan) {
              await planService.updatePlan({ id: editingPlan.id, ...values });
            } else {
              await planService.createPlan(values);
            }
            setShowModal(false);
            setEditingPlan(null);
            loadPlanes(false);
          }}
        />
      )}
    </div>
  );
}

function PlanMetric({ icon: Icon, label, value, detail, tone }: { icon: typeof Wifi; label: string; value: number | string; detail: string; tone: 'orange' | 'amber' | 'green' | 'blue' }) {
  const tones = {
    orange: 'bg-[#FFE2CC] text-[#C94A00]',
    amber: 'bg-[#FFF2E7] text-[#D63B00]',
    green: 'bg-[#DDF8E9] text-[#009A4E]',
    blue: 'bg-[#EAF3FF] text-[#005DE8]',
  };
  return (
    <article className="flex h-[112px] items-center gap-4 rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
      <div className={`grid h-12 w-12 place-items-center rounded-full ${tones[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#6B625C]">{label}</p>
        <p className="mt-1 truncate text-2xl font-extrabold tracking-[-0.025em] text-[#1F1F1F]">{value}</p>
        <p className="mt-1 text-xs font-extrabold text-[#009A4E]">{detail}</p>
      </div>
    </article>
  );
}

function PlanCard({ plan, clients, onEdit, onToggle }: { plan: Plan; clients: number; onEdit: () => void; onToggle: () => void }) {
  const speed = plan.velocidad || plan.nombre.match(/(\d+)/)?.[1] || '0';
  const tipo = plan.tipo || 'Residencial';
  const isResidencial = tipo === 'Residencial';
  
  return (
    <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)] flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`grid h-14 w-14 place-items-center rounded-[18px] ${isResidencial ? 'bg-[#FFF2E7] text-[#F24A00]' : 'bg-[#F1E8FF] text-[#6B35C9]'}`}>
              <Wifi className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1F1F1F]">{plan.nombre}</h2>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${isResidencial ? 'bg-[#EAF3FF] text-[#005DE8]' : 'bg-[#F1E8FF] text-[#6B35C9]'}`}>
                {tipo}
              </span>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${plan.activo ? 'bg-[#DDF8E9] text-[#009A4E]' : 'bg-[#F3EAE3] text-[#6B625C]'}`}>
            {plan.activo ? 'Activo' : 'Deshabilitado'}
          </span>
        </div>

        <div className="mt-5 text-center">
          <p className={`text-2xl font-extrabold tracking-[-0.025em] ${isResidencial ? 'text-[#F24A00]' : 'text-[#6B35C9]'}`}>
            {speed} Mbps
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-[#EDE4DC] border-y border-[#EDE4DC] py-3">
          <PlanFact label="Mensual" value={plan.precio_mensual ? formatMoney(plan.precio_mensual) : 'S/ 0.00'} />
          <PlanFact label="Instalacion" value={plan.instalacion ? formatMoney(plan.instalacion) : 'S/ 0.00'} />
          <PlanFact label="Clientes" value={String(clients)} />
        </div>

        {plan.beneficios && plan.beneficios.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {plan.beneficios.map((feature, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-semibold text-[#4B3024]">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${isResidencial ? 'text-[#F24A00]' : 'text-[#6B35C9]'}`} aria-hidden="true" />
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onEdit}
          className={`flex h-11 items-center justify-center gap-2 rounded-[13px] border bg-white text-sm font-extrabold hover:bg-[#FFF2E7] ${isResidencial ? 'border-[#F24A00] text-[#C94A00]' : 'border-[#6B35C9] text-[#6B35C9]'}`}
        >
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Editar
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-11 items-center justify-center gap-2 rounded-[13px] border border-[#E8D8CC] bg-white text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
        >
          <Power className="h-4 w-4" aria-hidden="true" />
          {plan.activo ? 'Deshabilitar' : 'Habilitar'}
        </button>
      </div>
    </article>
  );
}

function PlanFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A7F78]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#1F1F1F]">{value}</p>
    </div>
  );
}

function PlanFormModal({
  plan,
  onClose,
  onSubmit,
}: {
  plan: Plan | null;
  onClose: () => void;
  onSubmit: (values: PlanInsert) => void;
}) {
  const [nombre, setNombre] = useState(plan?.nombre || '');
  const [tipo, setTipo] = useState(plan?.tipo || 'Residencial');
  const [velocidad, setVelocidad] = useState<number | string>(plan?.velocidad || 100);
  const [precio, setPrecio] = useState<number | string>(plan?.precio_mensual || 89.9);
  const [instalacion, setInstalacion] = useState<number | string>(plan?.instalacion || 50);
  const [activo, setActivo] = useState(plan ? plan.activo : true);
  const [beneficiosStr, setBeneficiosStr] = useState(plan?.beneficios?.join('\n') || 'Internet ilimitado\nRouter incluido\nInstalacion rapida');

  return (
    <Modal open onClose={onClose} className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[680px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-7 py-5">
        <h2 className="text-xl font-extrabold text-[#1F1F1F]">{plan ? 'Editar plan' : 'Nuevo plan'}</h2>
        <button type="button" onClick={onClose} title="Cerrar" className="grid h-9 w-9 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7]">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <form
        className="hidden-scrollbar flex-1 space-y-5 overflow-y-auto px-7 py-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            nombre,
            tipo,
            velocidad: Number(velocidad),
            precio_mensual: Number(precio),
            instalacion: Number(instalacion),
            activo,
            beneficios: beneficiosStr.split('\n').map(b => b.trim()).filter(Boolean)
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Nombre del plan</span>
            <input
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Tipo</span>
            <div className="mt-2">
              <ComboBox
                value={tipo}
                onChange={(value) => setTipo(value)}
                options={[
                  { value: 'Residencial', label: 'Residencial' },
                  { value: 'Empresarial', label: 'Empresarial' },
                ]}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Velocidad Mbps</span>
            <input
              required
              type="text"
              inputMode="numeric"
              value={velocidad}
              onChange={(e) => setVelocidad(e.target.value.replace(/[^0-9]/g, ''))}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Precio mensual</span>
            <input
              required
              type="text"
              inputMode="decimal"
              value={precio}
              onChange={(e) => {
                const val = e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
                if (val.split('.').length <= 2) setPrecio(val);
              }}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Instalacion</span>
            <input
              required
              type="text"
              inputMode="decimal"
              value={instalacion}
              onChange={(e) => {
                const val = e.target.value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
                if (val.split('.').length <= 2) setInstalacion(val);
              }}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Estado</span>
            <div className="mt-2">
              <ComboBox
                value={String(activo)}
                onChange={(value) => setActivo(value === 'true')}
                options={[
                  { value: 'true', label: 'Activo' },
                  { value: 'false', label: 'Deshabilitado' },
                ]}
              />
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">Beneficios del plan</span>
          <textarea
            value={beneficiosStr}
            onChange={(e) => setBeneficiosStr(e.target.value)}
            placeholder="Un beneficio por linea"
            className="mt-2 min-h-[128px] w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-[#E8D8CC] pt-5">
          <button type="button" onClick={onClose} className="h-11 min-w-[140px] rounded-[13px] border border-[#E8B9A3] bg-white px-5 text-sm font-extrabold text-[#1F1F1F] hover:bg-[#FFF2E7]">
            Cancelar
          </button>
          <button type="submit" disabled={!nombre.trim()} className="h-11 min-w-[160px] rounded-[13px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_12px_18px_rgba(201,74,0,0.18)] disabled:opacity-50">
            Guardar plan
          </button>
        </div>
      </form>
    </Modal>
  );
}
