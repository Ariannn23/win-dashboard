import { isSupabaseConfigured } from '@/services/supabase/client';
import { localAuthService } from './localAuthService';
import { supabaseAuthService } from './supabaseAuthService';
import type { AuthDataService } from './types';

export const authDataService: AuthDataService = isSupabaseConfigured ? supabaseAuthService : localAuthService;

export type { AuthDataService } from './types';
