import type { Role, SaleStatus } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  BACK: 'Back office',
  SUPERVISOR: 'Supervisor',
  ASESOR: 'Asesor',
};

export const STATUS_LABELS: Record<SaleStatus, string> = {
  PENDIENTE_GRABACION: 'Pendiente grabacion',
  PROGRAMADO_GRABACION: 'Programado grabacion',
  GRABADO: 'Grabado',
  PROGRAMADO_INSTALACION: 'Programado instalacion',
  INSTALADO: 'Instalado',
  RECHAZADO: 'Rechazado',
  CANCELADO: 'Cancelado',
};

export const STATUS_ORDER: SaleStatus[] = [
  'PENDIENTE_GRABACION',
  'PROGRAMADO_GRABACION',
  'GRABADO',
  'PROGRAMADO_INSTALACION',
  'INSTALADO',
];

export const FINAL_STATUSES: SaleStatus[] = ['INSTALADO', 'CANCELADO'];

export const PLAN_OPTIONS = [
  '350 MBPS + FONOWIN',
  '550 MBPS SOLO INTERNET',
  '550 MBPS + WINTV PREMIUM',
  '750 MBPS SOLO INTERNET',
  '750 MBPS + WINTV PREMIUM',
  '1000 MBPS SOLO INTERNET',
  '1000 MBPS + WIN TV L1 MAX',
  '1000 MBPS + DGO HOGAR',
  '1000 MBPS + DGO FULL',
  'Otro',
] as const;

export const DISTRICTS = [
  'Trujillo',
  'La Esperanza',
  'El Porvenir',
  'Florencia de Mora',
  'Victor Larco',
  'Moche',
  'Huanchaco',
  'Laredo',
] as const;
