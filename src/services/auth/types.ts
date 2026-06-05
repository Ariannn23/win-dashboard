import type { Profile } from '@/types';

export interface AuthDataService {
  getCurrentProfile: (profiles: Profile[]) => Promise<Profile | null>;
  signIn: (correo: string, password: string, profiles: Profile[]) => Promise<Profile>;
  signOut: () => Promise<void>;
}
