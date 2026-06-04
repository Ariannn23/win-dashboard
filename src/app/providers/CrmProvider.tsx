import { createContext, useContext, useMemo, useState } from 'react';
import { demoHistory, demoProfiles, demoSales } from '@/mocks/demoData';
import { STATUS_ORDER } from '@/shared/lib/constants';
import { canChangeStatus, canViewSale } from '@/shared/lib/permissions';
import type { Profile, Sale, SaleStatus, StatusHistory } from '@/types';

interface CrmContextValue {
  isLoading: boolean;
  profiles: Profile[];
  sales: Sale[];
  history: StatusHistory[];
  visibleSales: (user: Profile | null) => Sale[];
  upsertSale: (payload: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'estado' | 'creado_por'> & Partial<Pick<Sale, 'id' | 'estado' | 'creado_por'>>) => Sale;
  changeSaleStatus: (saleId: string, nextStatus: SaleStatus, user: Profile, comentario: string) => void;
  upsertProfile: (payload: Omit<Profile, 'id' | 'created_at'> & Partial<Pick<Profile, 'id'>>) => Profile;
  toggleProfile: (id: string) => void;
  getProfile: (id: string) => Profile | undefined;
}

const CrmContext = createContext<CrmContextValue | null>(null);

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

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    readStorage(PROFILES_KEY, demoProfiles).map(normalizeProfile),
  );
  const [sales, setSales] = useState<Sale[]>(() => readStorage(SALES_KEY, demoSales));
  const [history, setHistory] = useState<StatusHistory[]>(() =>
    readStorage(HISTORY_KEY, demoHistory),
  );

  function commitSales(next: Sale[]) {
    setSales(next);
    writeStorage(SALES_KEY, next);
  }

  function commitProfiles(next: Profile[]) {
    setProfiles(next);
    writeStorage(PROFILES_KEY, next);
  }

  function commitHistory(next: StatusHistory[]) {
    setHistory(next);
    writeStorage(HISTORY_KEY, next);
  }

  function getProfile(id: string) {
    return profiles.find((profile) => profile.id === id);
  }

  function visibleSales(user: Profile | null) {
    return sales.filter((sale) => canViewSale(user, sale));
  }

  function upsertSale(
    payload: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'estado' | 'creado_por'> &
      Partial<Pick<Sale, 'id' | 'estado' | 'creado_por'>>,
  ) {
    const now = new Date().toISOString();
    const existing = payload.id ? sales.find((sale) => sale.id === payload.id) : undefined;
    const sale: Sale = {
      ...payload,
      id: existing?.id ?? crypto.randomUUID(),
      estado: existing?.estado ?? payload.estado ?? 'PENDIENTE_GRABACION',
      creado_por: existing?.creado_por ?? payload.creado_por ?? payload.supervisor_id,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };

    const next = existing
      ? sales.map((item) => (item.id === existing.id ? sale : item))
      : [sale, ...sales];

    commitSales(next);
    return sale;
  }

  function changeSaleStatus(
    saleId: string,
    nextStatus: SaleStatus,
    user: Profile,
    comentario: string,
  ) {
    if (!canChangeStatus(user)) {
      throw new Error('No tienes permiso para cambiar estados');
    }

    const target = sales.find((sale) => sale.id === saleId);
    if (!target) throw new Error('Venta no encontrada');

    const currentIndex = STATUS_ORDER.indexOf(target.estado);
    const nextIndex = STATUS_ORDER.indexOf(nextStatus);
    const isAlternative = nextStatus === 'RECHAZADO' || nextStatus === 'CANCELADO';
    const isForwardStep = currentIndex >= 0 && nextIndex > currentIndex;

    if (!isAlternative && !isForwardStep && nextStatus !== target.estado) {
      throw new Error('El estado debe avanzar segun el flujo permitido');
    }

    const now = new Date().toISOString();
    const updatedSale = { ...target, estado: nextStatus, updated_at: now };
    commitSales(sales.map((sale) => (sale.id === saleId ? updatedSale : sale)));

    if (target.estado !== nextStatus) {
      commitHistory([
        {
          id: crypto.randomUUID(),
          venta_id: saleId,
          usuario_id: user.id,
          usuario_nombre: user.nombres,
          estado_anterior: target.estado,
          estado_nuevo: nextStatus,
          comentario,
          created_at: now,
        },
        ...history,
      ]);
    }
  }

  function upsertProfile(payload: Omit<Profile, 'id' | 'created_at'> & Partial<Pick<Profile, 'id'>>) {
    const now = new Date().toISOString();
    const existing = payload.id ? profiles.find((profile) => profile.id === payload.id) : undefined;
    const profile: Profile = {
      ...payload,
      id: existing?.id ?? crypto.randomUUID(),
      correo_recuperacion: payload.correo_recuperacion ?? existing?.correo_recuperacion ?? '',
      created_at: existing?.created_at ?? now,
    };

    const next = existing
      ? profiles.map((item) => (item.id === existing.id ? profile : item))
      : [profile, ...profiles];

    commitProfiles(next);
    return profile;
  }

  function toggleProfile(id: string) {
    commitProfiles(
      profiles.map((profile) =>
        profile.id === id ? { ...profile, activo: !profile.activo } : profile,
      ),
    );
  }

  const value = useMemo(
    () => ({
      isLoading: false,
      profiles,
      sales,
      history,
      visibleSales,
      upsertSale,
      changeSaleStatus,
      upsertProfile,
      toggleProfile,
      getProfile,
    }),
    [history, profiles, sales],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const value = useContext(CrmContext);
  if (!value) throw new Error('useCrm debe usarse dentro de CrmProvider');
  return value;
}
