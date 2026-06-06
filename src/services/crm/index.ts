import { isSupabaseConfigured } from '@/services/supabase/client';
import { localCrmService } from './localCrmService';
import { supabaseCrmService } from './supabaseCrmService';
import type { CrmDataService } from './types';

export const crmDataService: CrmDataService = isSupabaseConfigured ? supabaseCrmService : localCrmService;

export type {
  CrmDataService,
  CrmSnapshot,
  SaleUpsertPayload,
  StatusChangeResult,
} from './types';
export type { ProfileUpsertPayload } from '@/types';
