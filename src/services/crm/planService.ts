import { supabase } from '@/services/supabase/client';

export interface Plan {
  id: string;
  nombre: string;
  activo: boolean;
  tipo?: string;
  velocidad?: number;
  precio_mensual?: number;
  instalacion?: number;
  beneficios?: string[];
  created_at: string;
}

export type PlanInsert = Omit<Plan, 'id' | 'created_at' | 'activo'> & { activo?: boolean };
export type PlanUpdate = Partial<PlanInsert> & { id: string };

export const planService = {
  async getPlans(): Promise<Plan[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('planes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Plan[];
  },

  async updatePlan(plan: PlanUpdate): Promise<Plan> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { id, ...updates } = plan;
    const { data, error } = await supabase
      .from('planes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Plan;
  },

  async createPlan(plan: PlanInsert): Promise<Plan> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('planes')
      .insert([plan])
      .select()
      .single();

    if (error) throw error;
    return data as Plan;
  },

  async togglePlan(id: string, activo: boolean): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase
      .from('planes')
      .update({ activo })
      .eq('id', id);

    if (error) throw error;
  }
};
