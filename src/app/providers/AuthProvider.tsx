import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCrm } from '@/app/providers/CrmProvider';
import { isSupabaseConfigured, supabase } from '@/services/supabase/client';
import type { Profile } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  profiles: Profile[];
  login: (correo: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'win-crm-active-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profiles } = useCrm();
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    async function restoreSession() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email?.toLowerCase();
        const profile = email
          ? profiles.find((item) => item.correo.toLowerCase() === email && item.activo)
          : null;
        setUser(profile ?? null);
        return;
      }

      const storedId = localStorage.getItem(STORAGE_KEY);
      setUser(profiles.find((profile) => profile.id === storedId && profile.activo) ?? null);
    }

    void restoreSession();
  }, [profiles]);

  async function login(correo: string, password = '') {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: correo,
        password,
      });
      if (error) throw new Error(error.message);
    }

    const profile = profiles.find(
      (item) => item.correo.toLowerCase() === correo.toLowerCase() && item.activo,
    );
    if (!profile) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    if (!isSupabaseConfigured) {
      localStorage.setItem(STORAGE_KEY, profile.id);
    }
    setUser(profile);
  }

  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, profiles, login, logout }), [profiles, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
}
