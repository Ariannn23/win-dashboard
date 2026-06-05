import { useMemo, useState } from 'react';
import { initialPlans, type InternetPlan, type PlanType } from '@/features/plans/data/planCatalog';
import { useToast } from '@/shared/ui/Toast';

export type PlanStatusFilter = 'TODOS' | 'ACTIVO' | 'INACTIVO';
export type PlanTypeFilter = 'TODOS' | PlanType;
export type PlanFormValues = Omit<InternetPlan, 'id' | 'activeClients'>;

export function usePlans() {
  const [plans, setPlans] = useState<InternetPlan[]>(initialPlans);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<PlanTypeFilter>('TODOS');
  const [status, setStatus] = useState<PlanStatusFilter>('TODOS');
  const [editing, setEditing] = useState<InternetPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const filteredPlans = useMemo(() => {
    const text = query.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesText = !text || plan.name.toLowerCase().includes(text) || `${plan.speed}`.includes(text);
      const matchesType = type === 'TODOS' || plan.type === type;
      const matchesStatus =
        status === 'TODOS' ||
        (status === 'ACTIVO' && plan.active) ||
        (status === 'INACTIVO' && !plan.active);
      return matchesText && matchesType && matchesStatus;
    });
  }, [plans, query, status, type]);

  const metrics = useMemo(() => {
    const activePlans = plans.filter((plan) => plan.active).length;
    const bestSeller = plans.slice().sort((a, b) => b.activeClients - a.activeClients)[0];
    const estimatedIncome = plans.reduce((total, plan) => total + (plan.active ? plan.monthlyPrice * plan.activeClients : 0), 0);
    const activeClients = plans.reduce((total, plan) => total + (plan.active ? plan.activeClients : 0), 0);
    return { activePlans, bestSeller, estimatedIncome, activeClients };
  }, [plans]);

  const openNewPlan = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEditPlan = (plan: InternetPlan) => {
    if (!plan.active) {
      showToast({
        title: 'Plan deshabilitado',
        detail: 'Habilita el plan antes de editar su informacion comercial.',
        tone: 'warning',
      });
      return;
    }
    setEditing(plan);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const clearFilters = () => {
    setQuery('');
    setType('TODOS');
    setStatus('TODOS');
  };

  const savePlan = (values: PlanFormValues) => {
    if (editing) {
      setPlans((current) => current.map((plan) => (plan.id === editing.id ? { ...plan, ...values } : plan)));
    } else {
      setPlans((current) => [{ ...values, id: crypto.randomUUID(), activeClients: 0 }, ...current]);
    }
    showToast({
      title: editing ? 'Plan actualizado' : 'Plan creado',
      detail: 'La informacion comercial del plan quedo guardada.',
      tone: 'success',
    });
    closeForm();
  };

  const togglePlan = (planId: string) => {
    setPlans((current) => current.map((plan) => (plan.id === planId ? { ...plan, active: !plan.active } : plan)));
    showToast({ title: 'Estado del plan actualizado', detail: 'El cambio ya se refleja en las cards.', tone: 'success' });
  };

  return {
    clearFilters,
    closeForm,
    editing,
    filteredPlans,
    metrics,
    openEditPlan,
    openNewPlan,
    query,
    savePlan,
    setQuery,
    setStatus,
    setType,
    showForm,
    status,
    togglePlan,
    type,
  };
}
