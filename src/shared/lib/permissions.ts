import { FINAL_STATUSES } from './constants';
import type { Profile, Sale } from '@/types';

export function canChangeStatus(user?: Profile | null) {
  return user?.rol === 'ADMIN' || user?.rol === 'BACK';
}

export function canManageUsers(user?: Profile | null) {
  return user?.rol === 'ADMIN';
}

export function canManageAsesores(user?: Profile | null) {
  return user?.rol === 'ADMIN' || user?.rol === 'SUPERVISOR';
}

export function canCreateSales(user?: Profile | null) {
  return user?.rol === 'ADMIN' || user?.rol === 'SUPERVISOR';
}

export function canEditSale(user: Profile | null | undefined, sale: Sale) {
  if (!user) return false;
  if (user.rol === 'ADMIN') return true;
  if (user.rol === 'SUPERVISOR') {
    return (
      (sale.creado_por === user.id || sale.supervisor_id === user.id) &&
      (sale.estado === 'PENDIENTE_GRABACION' || sale.estado === 'RECHAZADO')
    );
  }
  return false;
}

export function canViewSale(user: Profile | null | undefined, sale: Sale) {
  if (!user) return false;
  if (user.rol === 'ADMIN' || user.rol === 'BACK') return true;
  if (user.rol === 'SUPERVISOR') return sale.creado_por === user.id || sale.supervisor_id === user.id;
  return sale.asesor_id === user.id;
}

export function isFinalSale(sale: Sale) {
  return FINAL_STATUSES.includes(sale.estado);
}
