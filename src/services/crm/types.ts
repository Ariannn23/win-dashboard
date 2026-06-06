import type { Profile, ProfileUpsertPayload, Sale, SaleStatus, StatusHistory, Role } from '@/types';

export interface CrmSnapshot {
  profiles: Profile[];
  sales: Sale[];
  history: StatusHistory[];
}

export type SaleUpsertPayload =
  Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'estado' | 'creado_por'> &
    Partial<Pick<Sale, 'id' | 'estado' | 'creado_por'>>;



export interface StatusChangeResult {
  sale: Sale;
  history?: StatusHistory;
}

export interface CrmDataService {
  loadSnapshot: () => Promise<CrmSnapshot>;
  upsertSale: (payload: SaleUpsertPayload, snapshot: CrmSnapshot) => Promise<Sale>;
  changeSaleStatus: (
    saleId: string,
    nextStatus: SaleStatus,
    user: Profile,
    comentario: string,
    snapshot: CrmSnapshot,
  ) => Promise<StatusChangeResult>;
  upsertProfile: (payload: ProfileUpsertPayload, snapshot: CrmSnapshot) => Promise<Profile>;
  toggleProfile: (id: string, snapshot: CrmSnapshot) => Promise<Profile>;
}
