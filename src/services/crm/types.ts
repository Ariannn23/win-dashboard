import type { Profile, Sale, SaleStatus, StatusHistory, Role } from '@/types';

export interface CrmSnapshot {
  profiles: Profile[];
  sales: Sale[];
  history: StatusHistory[];
}

export type SaleUpsertPayload =
  Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'estado' | 'creado_por'> &
    Partial<Pick<Sale, 'id' | 'estado' | 'creado_por'>>;

export interface Profile {
  id: string;
  nombres: string;
  correo: string;
  correo_recuperacion: string;
  direccion: string;
  fecha_nacimiento: string;
  celular: string;
  rol: Role;
  activo: boolean;
  created_at: string;
}

export interface ProfileUpsertPayload {
  id?: string;
  nombres: string;
  dni?: string;
  correo: string;
  correo_recuperacion: string;
  direccion: string;
  fecha_nacimiento: string;
  celular: string;
  rol: Role;
  activo: boolean;
  password?: string;
}

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
