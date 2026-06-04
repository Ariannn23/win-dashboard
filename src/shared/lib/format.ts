import type { SaleStatus } from '@/types';

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatTimeOnly(value: string) {
  return new Intl.DateTimeFormat('es-PE', { timeStyle: 'short' }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatMoney(value: number) {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function statusTone(status: SaleStatus) {
  return {
    PENDIENTE_GRABACION: 'bg-amber-50 text-amber-700 ring-amber-200',
    PROGRAMADO_GRABACION: 'bg-sky-50 text-sky-700 ring-sky-200',
    GRABADO: 'bg-violet-50 text-violet-700 ring-violet-200',
    PROGRAMADO_INSTALACION: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    INSTALADO: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    RECHAZADO: 'bg-rose-50 text-rose-700 ring-rose-200',
    CANCELADO: 'bg-slate-100 text-slate-700 ring-slate-200',
  }[status];
}
