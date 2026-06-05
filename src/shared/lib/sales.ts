import { STATUS_LABELS } from '@/shared/lib/constants';
import type { Profile, Sale, SaleStatus } from '@/types';

export type ClientStatus = 'ACTIVO';
export type ClientType = 'HOGAR' | 'EMPRESA';

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ACTIVO: 'Activo',
};

export function saleAmount(sale: Sale) {
  return planBasePrice(sale.plan_contratar) + sale.mesh * 12 + sale.win_box * 15;
}

export function planPriceLabel(sale: Sale) {
  return `S/ ${saleAmount(sale).toFixed(2)}`;
}

export function planBasePrice(plan: string) {
  if (plan.includes('1000')) return 120;
  if (plan.includes('750')) return 89;
  return 65;
}

export function planBasePriceLabel(plan: string) {
  return `S/ ${planBasePrice(plan).toFixed(2)}`;
}

export function speedFromPlan(plan: string) {
  return plan.match(/\d+\s?MBPS/i)?.[0]?.replace(/MBPS/i, 'Mbps') ?? plan;
}

export function planGroup(plan: string) {
  const speed = speedFromPlan(plan);
  return plan.toLowerCase().includes('empresa') ? `Empresa ${speed}` : `Hogar ${speed}`;
}

export function clientStatus(status: SaleStatus): ClientStatus {
  return 'ACTIVO';
}

export function clientType(sale: Sale): ClientType {
  return sale.plan_contratar.toLowerCase().includes('empresa') || sale.nombres_cliente.toLowerCase().includes('sac')
    ? 'EMPRESA'
    : 'HOGAR';
}

export function profileName(id: string, profiles: Profile[]) {
  return profiles.find((profile) => profile.id === id)?.nombres ?? 'Sin asignar';
}

export function saleStatusLabel(status: SaleStatus) {
  return STATUS_LABELS[status];
}

export function isFinalSaleStatus(status: SaleStatus) {
  return status === 'INSTALADO' || status === 'RECHAZADO' || status === 'CANCELADO';
}
