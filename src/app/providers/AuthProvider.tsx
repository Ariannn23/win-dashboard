import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useCrm } from '@/app/providers/CrmProvider';
import { authDataService } from '@/services/auth';
import type { Profile } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  profiles: Profile[];
  login: (correo: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profiles, reload } = useCrm();
  const [user, setUser] = useState<Profile | null>(null);
  const reloadedUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const profile = await authDataService.getCurrentProfile(profiles);
        if (!mounted) return;

        setUser(profile);

        if (profile && reloadedUserId.current !== profile.id) {
          reloadedUserId.current = profile.id;
          await reload();
        }
      } catch {
        if (mounted) setUser(null);
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [profiles, reload]);

  async function login(correo: string, password = '') {
    const profile = await authDataService.signIn(correo, password, profiles);
    reloadedUserId.current = profile.id;
    setUser(profile);
    await reload();
  }

  async function logout() {
    await authDataService.signOut();
    reloadedUserId.current = null;
    setUser(null);
    await reload();
  }

  const value = useMemo(() => ({ user, profiles, login, logout }), [profiles, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
}
