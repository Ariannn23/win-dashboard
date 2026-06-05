import {
  CheckCircle2,
  Edit3,
  Plus,
  Power,
  Search,
  ShieldCheck,
  UsersRound,
  Wifi,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { blankPlan, type InternetPlan, type PlanType } from '@/features/plans/data/planCatalog';
import { usePlans, type PlanFormValues, type PlanStatusFilter, type PlanTypeFilter } from '@/features/plans/hooks/usePlans';
import { formatMoney } from '@/shared/lib/format';
import { ComboBox } from '@/shared/ui/FormControls';
import { Modal } from '@/shared/ui/Modal';
import { PageSkeleton } from '@/shared/ui/Skeleton';

function typeTone(type: PlanType) {
  return type === 'Residencial' ? 'bg-[#EAF3FF] text-[#005DE8]' : 'bg-[#F1E8FF] text-[#6B35C9]';
}

export function PlansPage() {
  const isLoading = false;
  const plansState = usePlans();
  const { activePlans, activeClients, bestSeller, estimatedIncome } = plansState.metrics;

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
          onClick={plansState.openNewPlan}
          className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo plan
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PlanMetric icon={Wifi} label="Planes activos" value={activePlans} detail="Disponibles para venta" tone="orange" />
        <PlanMetric icon={ShieldCheck} label="Plan mas vendido" value={bestSeller?.name ?? '-'} detail={`${bestSeller?.activeClients ?? 0} clientes`} tone="amber" />
        <PlanMetric icon={CheckCircle2} label="Ingresos estimados" value={formatMoney(estimatedIncome)} detail="Mensual proyectado" tone="green" />
        <PlanMetric icon={UsersRound} label="Clientes activos" value={activeClients.toLocaleString('es-PE')} detail="Con plan habilitado" tone="blue" />
      </section>

      <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7F78]" aria-hidden="true" />
            <input
              value={plansState.query}
              onChange={(event) => plansState.setQuery(event.target.value)}
              placeholder="Buscar plan por nombre o velocidad..."
              className="h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] pl-11 pr-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </label>
          <ComboBox
            value={plansState.type}
            onChange={(value) => plansState.setType(value as PlanTypeFilter)}
            options={[
              { value: 'TODOS', label: 'Todos los tipos' },
              { value: 'Residencial', label: 'Residencial' },
              { value: 'Empresarial', label: 'Empresarial' },
            ]}
          />
          <ComboBox
            value={plansState.status}
            onChange={(value) => plansState.setStatus(value as PlanStatusFilter)}
            options={[
              { value: 'TODOS', label: 'Todos los estados' },
              { value: 'ACTIVO', label: 'Activos' },
              { value: 'INACTIVO', label: 'Deshabilitados' },
            ]}
          />
          <button
            type="button"
            onClick={() => {
              plansState.clearFilters();
            }}
            className="h-12 rounded-[14px] border border-[#E8D8CC] bg-white px-5 text-sm font-extrabold text-[#6B625C] hover:bg-[#FFF2E7]"
          >
            Limpiar
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {plansState.filteredPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={() => {
              plansState.openEditPlan(plan);
            }}
            onToggle={() => plansState.togglePlan(plan.id)}
          />
        ))}
      </section>

      {plansState.showForm && (
        <PlanFormModal
          plan={plansState.editing}
          onClose={plansState.closeForm}
          onSubmit={plansState.savePlan}
        />
      )}
    </div>
  );
}

function PlanMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Wifi;
  label: string;
  value: number | string;
  detail: string;
  tone: 'orange' | 'amber' | 'green' | 'blue';
}) {
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

function PlanCard({ plan, onEdit, onToggle }: { plan: InternetPlan; onEdit: () => void; onToggle: () => void }) {
  return (
    <article className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`grid h-14 w-14 place-items-center rounded-[18px] ${plan.type === 'Residencial' ? 'bg-[#FFF2E7] text-[#F24A00]' : 'bg-[#F1E8FF] text-[#6B35C9]'}`}>
            <Wifi className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1F1F1F]">{plan.name}</h2>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold ${typeTone(plan.type)}`}>
              {plan.type}
            </span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${plan.active ? 'bg-[#DDF8E9] text-[#009A4E]' : 'bg-[#F3EAE3] text-[#6B625C]'}`}>
          {plan.active ? 'Activo' : 'Deshabilitado'}
        </span>
      </div>

      <div className="mt-5 text-center">
        <p className={`text-2xl font-extrabold tracking-[-0.025em] ${plan.type === 'Residencial' ? 'text-[#F24A00]' : 'text-[#6B35C9]'}`}>
          {plan.speed} Mbps
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#EDE4DC] border-y border-[#EDE4DC] py-3">
        <PlanFact label="Mensual" value={formatMoney(plan.monthlyPrice)} />
        <PlanFact label="Instalacion" value={formatMoney(plan.installationPrice)} />
        <PlanFact label="Clientes" value={String(plan.activeClients)} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {plan.features.map((feature) => (
          <span key={feature} className="flex items-center gap-2 text-sm font-semibold text-[#4B3024]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#F24A00]" aria-hidden="true" />
            {feature}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-11 items-center justify-center gap-2 rounded-[13px] border border-[#F24A00] bg-white text-sm font-extrabold text-[#C94A00] hover:bg-[#FFF2E7]"
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
          {plan.active ? 'Deshabilitar' : 'Habilitar'}
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
  plan: InternetPlan | null;
  onClose: () => void;
  onSubmit: (values: PlanFormValues) => void;
}) {
  const [values, setValues] = useState<PlanFormValues>(
    plan
      ? {
          name: plan.name,
          type: plan.type,
          speed: plan.speed,
          monthlyPrice: plan.monthlyPrice,
          installationPrice: plan.installationPrice,
          active: plan.active,
          features: plan.features,
        }
      : blankPlan,
  );
  const [featuresText, setFeaturesText] = useState(values.features.join('\n'));

  const update = <K extends keyof PlanFormValues>(
    key: K,
    value: PlanFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

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
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            ...values,
            features: featuresText
              .split('\n')
              .map((feature) => feature.trim())
              .filter(Boolean),
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <PlanField label="Nombre del plan">
            <input
              required
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </PlanField>
          <PlanField label="Tipo">
            <div className="mt-2">
              <ComboBox
                value={values.type}
                onChange={(value) => update('type', value as PlanType)}
                options={[
                  { value: 'Residencial', label: 'Residencial' },
                  { value: 'Empresarial', label: 'Empresarial' },
                ]}
              />
            </div>
          </PlanField>
          <PlanField label="Velocidad Mbps">
            <input
              required
              type="number"
              min={1}
              value={values.speed}
              onChange={(event) => update('speed', Number(event.target.value))}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </PlanField>
          <PlanField label="Precio mensual">
            <input
              required
              type="number"
              min={0}
              step="0.1"
              value={values.monthlyPrice}
              onChange={(event) => update('monthlyPrice', Number(event.target.value))}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </PlanField>
          <PlanField label="Instalacion">
            <input
              required
              type="number"
              min={0}
              step="0.1"
              value={values.installationPrice}
              onChange={(event) => update('installationPrice', Number(event.target.value))}
              className="mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
            />
          </PlanField>
          <PlanField label="Estado">
            <div className="mt-2">
              <ComboBox
                value={String(values.active)}
                onChange={(value) => update('active', value === 'true')}
                options={[
                  { value: 'true', label: 'Activo' },
                  { value: 'false', label: 'Deshabilitado' },
                ]}
              />
            </div>
          </PlanField>
        </div>

        <PlanField label="Beneficios del plan">
          <textarea
            value={featuresText}
            onChange={(event) => setFeaturesText(event.target.value)}
            placeholder="Un beneficio por linea"
            className="mt-2 min-h-[128px] w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
          />
        </PlanField>

        <div className="flex justify-end gap-3 border-t border-[#E8D8CC] pt-5">
          <button type="button" onClick={onClose} className="h-11 min-w-[140px] rounded-[13px] border border-[#E8B9A3] bg-white px-5 text-sm font-extrabold text-[#1F1F1F] hover:bg-[#FFF2E7]">
            Cancelar
          </button>
          <button type="submit" className="h-11 min-w-[160px] rounded-[13px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-5 text-sm font-extrabold text-white shadow-[0_12px_18px_rgba(201,74,0,0.18)]">
            Guardar plan
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PlanField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#4B3024]">{label}</span>
      {children}
    </label>
  );
}
