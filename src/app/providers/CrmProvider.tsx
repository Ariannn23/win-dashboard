import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { crmDataService, type CrmSnapshot, type ProfileUpsertPayload, type SaleUpsertPayload } from '@/services/crm';
import { canViewSale } from '@/shared/lib/permissions';
import type { Profile, Sale, SaleStatus, StatusHistory } from '@/types';

interface CrmContextValue {
  isLoading: boolean;
  profiles: Profile[];
  sales: Sale[];
  history: StatusHistory[];
  reload: () => Promise<void>;
  visibleSales: (user: Profile | null) => Sale[];
  upsertSale: (payload: SaleUpsertPayload) => Promise<Sale>;
  changeSaleStatus: (saleId: string, nextStatus: SaleStatus, user: Profile, comentario: string) => Promise<void>;
  upsertProfile: (payload: ProfileUpsertPayload) => Promise<Profile>;
  toggleProfile: (id: string) => Promise<void>;
  getProfile: (id: string) => Profile | undefined;
}

const emptySnapshot: CrmSnapshot = {
  profiles: [],
  sales: [],
  history: [],
};

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<CrmSnapshot>(emptySnapshot);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setSnapshot(await crmDataService.loadSnapshot());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const getProfile = useCallback(
    (id: string) => snapshot.profiles.find((profile) => profile.id === id),
    [snapshot.profiles],
  );

  const visibleSales = useCallback(
    (user: Profile | null) => snapshot.sales.filter((sale) => canViewSale(user, sale)),
    [snapshot.sales],
  );

  const upsertSale = useCallback(
    async (payload: SaleUpsertPayload) => {
      const sale = await crmDataService.upsertSale(payload, snapshot);
      setSnapshot((current) => {
        const exists = current.sales.some((item) => item.id === sale.id);
        return {
          ...current,
          sales: exists
            ? current.sales.map((item) => (item.id === sale.id ? sale : item))
            : [sale, ...current.sales],
        };
      });
      return sale;
    },
    [snapshot],
  );

  const changeSaleStatus = useCallback(
    async (saleId: string, nextStatus: SaleStatus, user: Profile, comentario: string) => {
      const result = await crmDataService.changeSaleStatus(saleId, nextStatus, user, comentario, snapshot);
      setSnapshot((current) => ({
        ...current,
        sales: current.sales.map((sale) => (sale.id === saleId ? result.sale : sale)),
        history: result.history ? [result.history, ...current.history] : current.history,
      }));
    },
    [snapshot],
  );

  const upsertProfile = useCallback(
    async (payload: ProfileUpsertPayload) => {
      const profile = await crmDataService.upsertProfile(payload, snapshot);
      setSnapshot((current) => {
        const exists = current.profiles.some((item) => item.id === profile.id);
        return {
          ...current,
          profiles: exists
            ? current.profiles.map((item) => (item.id === profile.id ? profile : item))
            : [profile, ...current.profiles],
        };
      });
      return profile;
    },
    [snapshot],
  );

  const toggleProfile = useCallback(
    async (id: string) => {
      const profile = await crmDataService.toggleProfile(id, snapshot);
      setSnapshot((current) => ({
        ...current,
        profiles: current.profiles.map((item) => (item.id === id ? profile : item)),
      }));
    },
    [snapshot],
  );

  const value = useMemo(
    () => ({
      isLoading,
      profiles: snapshot.profiles,
      sales: snapshot.sales,
      history: snapshot.history,
      reload,
      visibleSales,
      upsertSale,
      changeSaleStatus,
      upsertProfile,
      toggleProfile,
      getProfile,
    }),
    [changeSaleStatus, getProfile, isLoading, reload, snapshot.history, snapshot.profiles, snapshot.sales, toggleProfile, upsertProfile, upsertSale, visibleSales],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const value = useContext(CrmContext);
  if (!value) throw new Error('useCrm debe usarse dentro de CrmProvider');
  return value;
}
