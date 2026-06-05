import { supabase } from '@/services/supabase/client';

export interface Plan {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

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

  async createPlan(nombre: string): Promise<Plan> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('planes')
      .insert([{ nombre }])
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
