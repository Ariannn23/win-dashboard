import type { Profile } from '@/types';
import type { AuthDataService } from './types';

const STORAGE_KEY = 'win-crm-active-user';

function normalizeEmail(correo: string) {
  return correo.trim().toLowerCase();
}

export const localAuthService: AuthDataService = {
  async getCurrentProfile(profiles: Profile[]) {
    const storedId = localStorage.getItem(STORAGE_KEY);
    return profiles.find((profile) => profile.id === storedId && profile.activo) ?? null;
  },

  async signIn(correo: string, _password: string, profiles: Profile[]) {
    const email = normalizeEmail(correo);
    const profile = profiles.find((item) => item.correo.toLowerCase() === email && item.activo);

    if (!profile) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    localStorage.setItem(STORAGE_KEY, profile.id);
    return profile;
  },

  async signOut() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
