export type Role = 'ADMIN' | 'BACK' | 'SUPERVISOR' | 'ASESOR';

export type SaleStatus =
  | 'PENDIENTE_GRABACION'
  | 'PROGRAMADO_GRABACION'
  | 'GRABADO'
  | 'PROGRAMADO_INSTALACION'
  | 'INSTALADO'
  | 'RECHAZADO'
  | 'CANCELADO';

export type DocumentType = 'DNI' | 'CE' | 'PASAPORTE';
export type HousingType = 'Casa' | 'Multifamiliar';

export type ProfileUpsertPayload = Omit<Profile, 'id' | 'created_at'> & {
  id?: string;
  password?: string;
  supervisor_id?: string;
};

export interface Profile {
  id: string;
  nombres: string;
  dni?: string;
  correo: string;
  correo_recuperacion: string;
  direccion: string;
  fecha_nacimiento: string;
  celular: string;
  rol: Role;
  activo: boolean;
  supervisor_id?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  estado: SaleStatus;
  asesor_id: string;
  supervisor_id: string;
  creado_por: string;
  nombres_cliente: string;
  tipo_documento: DocumentType;
  numero_documento: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  correo_cliente: string;
  celular_principal: string;
  celular_referencia: string;
  titular_linea: string;
  direccion: string;
  coordenadas: string;
  tipo_vivienda: HousingType;
  distrito: string;
  referencia: string;
  plan_contratar: string;
  meses: number;
  mesh: number;
  win_box: number;
  observaciones: string;
  observaciones_back: string;
  foto_dni: string;
  foto_recibo: string;
  foto_selfie: string;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  venta_id: string;
  usuario_id: string;
  usuario_nombre: string;
  estado_anterior: SaleStatus;
  estado_nuevo: SaleStatus;
  comentario: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  pendiente: number;
  programadoGrabacion: number;
  grabado: number;
  programadoInstalacion: number;
  instalado: number;
  rechazado: number;
  cancelado: number;
}
