import { demoHistory, demoProfiles, demoSales } from '@/mocks/demoData';
import { STATUS_ORDER } from '@/shared/lib/constants';
import { canChangeStatus } from '@/shared/lib/permissions';
import type { Profile, Sale, SaleStatus, StatusHistory } from '@/types';
import type {
  CrmDataService,
  CrmSnapshot,
  ProfileUpsertPayload,
  SaleUpsertPayload,
  StatusChangeResult,
} from './types';

const SALES_KEY = 'win-crm-sales';
const PROFILES_KEY = 'win-crm-profiles';
const HISTORY_KEY = 'win-crm-history';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeProfile(profile: Profile): Profile {
  return {
    ...profile,
    correo_recuperacion: profile.correo_recuperacion ?? '',
  };
}

function persistSnapshot(snapshot: CrmSnapshot) {
  writeStorage(PROFILES_KEY, snapshot.profiles);
  writeStorage(SALES_KEY, snapshot.sales);
  writeStorage(HISTORY_KEY, snapshot.history);
}

function assertNextStatus(current: SaleStatus, next: SaleStatus) {
  const currentIndex = STATUS_ORDER.indexOf(current);
  const nextIndex = STATUS_ORDER.indexOf(next);
  const isAlternative = next === 'RECHAZADO' || next === 'CANCELADO';
  const isForwardStep = currentIndex >= 0 && nextIndex > currentIndex;

  if (!isAlternative && !isForwardStep && next !== current) {
    throw new Error('El estado debe avanzar segun el flujo permitido');
  }
}

export const localCrmService: CrmDataService = {
  async loadSnapshot() {
    return {
      profiles: readStorage(PROFILES_KEY, demoProfiles).map(normalizeProfile),
      sales: readStorage(SALES_KEY, demoSales),
      history: readStorage(HISTORY_KEY, demoHistory),
    };
  },

  async upsertSale(payload: SaleUpsertPayload, snapshot: CrmSnapshot) {
    const now = new Date().toISOString();
    const existing = payload.id ? snapshot.sales.find((sale) => sale.id === payload.id) : undefined;
    const sale: Sale = {
      ...payload,
      id: existing?.id ?? crypto.randomUUID(),
      estado: existing?.estado ?? payload.estado ?? 'PENDIENTE_GRABACION',
      creado_por: existing?.creado_por ?? payload.creado_por ?? payload.supervisor_id,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };

    persistSnapshot({
      ...snapshot,
      sales: existing
        ? snapshot.sales.map((item) => (item.id === existing.id ? sale : item))
        : [sale, ...snapshot.sales],
    });

    return sale;
  },

  async changeSaleStatus(
    saleId: string,
    nextStatus: SaleStatus,
    user: Profile,
    comentario: string,
    snapshot: CrmSnapshot,
  ): Promise<StatusChangeResult> {
    if (!canChangeStatus(user)) {
      throw new Error('No tienes permiso para cambiar estados');
    }

    const target = snapshot.sales.find((sale) => sale.id === saleId);
    if (!target) throw new Error('Venta no encontrada');
    assertNextStatus(target.estado, nextStatus);

    const now = new Date().toISOString();
    const sale = { ...target, estado: nextStatus, updated_at: now };
    const history: StatusHistory | undefined =
      target.estado === nextStatus
        ? undefined
        : {
            id: crypto.randomUUID(),
            venta_id: saleId,
            usuario_id: user.id,
            usuario_nombre: user.nombres,
            estado_anterior: target.estado,
            estado_nuevo: nextStatus,
            comentario,
            created_at: now,
          };

    persistSnapshot({
      ...snapshot,
      sales: snapshot.sales.map((item) => (item.id === saleId ? sale : item)),
      history: history ? [history, ...snapshot.history] : snapshot.history,
    });

    return { sale, history };
  },

  async upsertProfile(payload: ProfileUpsertPayload, snapshot: CrmSnapshot) {
    const now = new Date().toISOString();
    const existing = payload.id ? snapshot.profiles.find((profile) => profile.id === payload.id) : undefined;
    const profile: Profile = {
      ...payload,
      id: existing?.id ?? crypto.randomUUID(),
      correo_recuperacion: payload.correo_recuperacion ?? existing?.correo_recuperacion ?? '',
      created_at: existing?.created_at ?? now,
    };

    persistSnapshot({
      ...snapshot,
      profiles: existing
        ? snapshot.profiles.map((item) => (item.id === existing.id ? profile : item))
        : [profile, ...snapshot.profiles],
    });

    return profile;
  },

  async toggleProfile(id: string, snapshot: CrmSnapshot) {
    const target = snapshot.profiles.find((profile) => profile.id === id);
    if (!target) throw new Error('Usuario no encontrado');
    const profile = { ...target, activo: !target.activo };
    persistSnapshot({
      ...snapshot,
      profiles: snapshot.profiles.map((item) => (item.id === id ? profile : item)),
    });
    return profile;
  },
};
