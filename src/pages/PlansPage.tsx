import { useState, useEffect } from 'react';
import { planService, type Plan } from '@/services/crm/planService';
import { Plus } from 'lucide-react';

export function PlansPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [newPlanName, setNewPlanName] = useState('');

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      const data = await planService.getPlans();
      setPlanes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    try {
      await planService.createPlan(newPlanName.trim());
      setNewPlanName('');
      loadPlanes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id: string, activo: boolean) => {
    try {
      await planService.togglePlan(id, activo);
      loadPlanes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Planes y Promociones</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Gestiona los planes disponibles para ventas
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#EDE4DC] bg-white p-5 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
        <form onSubmit={handleAdd} className="mb-6 flex gap-4">
          <input
            type="text"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            placeholder="Nombre del nuevo plan"
            className="flex-1 rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] px-4 h-12 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
          />
          <button
            type="submit"
            className="flex h-12 items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-6 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)] hover:shadow-lg transition-shadow"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar</span>
          </button>
        </form>

        <div className="overflow-hidden rounded-[16px] border border-[#EDE4DC]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF7F3]">
              <tr>
                <th className="px-6 py-4 font-extrabold text-[#4B3024]">Nombre del Plan</th>
                <th className="px-6 py-4 font-extrabold text-[#4B3024]">Estado</th>
                <th className="px-6 py-4 font-extrabold text-[#4B3024] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4DC]">
              {planes.map((plan) => (
                <tr key={plan.id} className="transition hover:bg-[#FFFDFC]">
                  <td className="px-6 py-4 font-semibold text-[#1F1F1F]">{plan.nombre}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
                        plan.activo
                          ? 'bg-[#DDF8E9] text-[#009A4E]'
                          : 'bg-[#F3EAE3] text-[#6B625C]'
                      }`}
                    >
                      {plan.activo ? 'Activo' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(plan.id, !plan.activo)}
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                        plan.activo
                          ? 'border border-[#E8D8CC] bg-[#F7F1EC] text-[#A99B91] hover:bg-[#F3EAE3]'
                          : 'border border-[#F24A00] bg-white text-[#C94A00] hover:bg-[#FFF2E7]'
                      }`}
                    >
                      {plan.activo ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                  </td>
                </tr>
              ))}
              {planes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center font-semibold text-[#8A7F78]">
                    No hay planes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
