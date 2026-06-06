import { supabase } from '@/services/supabase/client';
import type { Profile } from '@/types';
import type { AuthDataService } from './types';

function requireSupabase() {
  if (!supabase) throw new Error('Supabase no esta configurado');
  return supabase;
}

function normalizeEmail(correo: string) {
  return correo.trim().toLowerCase();
}

function normalizeProfile(profile: Profile): Profile {
  return {
    ...profile,
    correo_recuperacion: profile.correo_recuperacion ?? '',
  };
}

async function getActiveProfile(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .eq('activo', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeProfile(data as Profile) : null;
}

export const supabaseAuthService: AuthDataService = {
  async getCurrentProfile() {
    const client = requireSupabase();
    const { data, error } = await client.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return getActiveProfile(data.user.id);
  },

  async signIn(correo: string, password: string) {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizeEmail(correo),
      password,
    });

    if (error) {
      throw new Error(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo iniciar sesión');
    }

    const profile = await getActiveProfile(data.user.id);
    if (!profile) {
      await client.auth.signOut();
      throw new Error('Usuario no encontrado o inactivo');
    }

    return profile;
  },

  async signOut() {
    const client = requireSupabase();
    await client.auth.signOut();
  },
};
