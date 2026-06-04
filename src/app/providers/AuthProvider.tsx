import { createContext, useContext, useMemo, useState } from 'react';
import { useCrm } from '@/app/providers/CrmProvider';
import type { Profile } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  profiles: Profile[];
  login: (correo: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'win-crm-active-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profiles } = useCrm();
  const [user, setUser] = useState<Profile | null>(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    return profiles.find((profile) => profile.id === storedId && profile.activo) ?? null;
  });

  async function login(correo: string) {
    const profile = profiles.find(
      (item) => item.correo.toLowerCase() === correo.toLowerCase() && item.activo,
    );
    if (!profile) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    localStorage.setItem(STORAGE_KEY, profile.id);
    setUser(profile);
  }

  function logout() {
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
