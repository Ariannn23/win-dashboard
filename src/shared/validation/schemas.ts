import { z } from 'zod';
import { PLAN_OPTIONS } from '@/shared/lib/constants';

export const coordinatesSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa las coordenadas')
  .max(100, 'Maximo 100 caracteres')
  .regex(/^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/, 'Usa el formato -8.111763, -79.028686');

const phoneSchema = z
  .string()
  .trim()
  .regex(/^9\d{8}$/, 'Ingresa un celular peruano valido de 9 digitos');

export const saleSchema = z.object({
  asesor_id: z.string().min(1, 'Selecciona un asesor'),
  supervisor_id: z.string().min(1, 'Selecciona un supervisor'),
  nombres_cliente: z.string().min(3, 'Ingresa nombres y apellidos'),
  tipo_documento: z.enum(['DNI', 'CE', 'PASAPORTE']),
  numero_documento: z.string().trim().min(8, 'Minimo 8 digitos').max(15, 'Maximo 15 caracteres'),
  fecha_nacimiento: z.string().min(1, 'Selecciona la fecha'),
  lugar_nacimiento: z.string().min(2, 'Ingresa lugar de nacimiento'),
  correo_cliente: z.string().email('Correo invalido'),
  celular_principal: phoneSchema,
  celular_referencia: phoneSchema,
  titular_linea: z.string().min(3, 'Ingresa titular de linea'),
  direccion: z.string().min(8, 'Ingresa direccion completa'),
  coordenadas: coordinatesSchema,
  tipo_vivienda: z.enum(['Casa', 'Multifamiliar']),
  distrito: z.string().min(1, 'Selecciona distrito'),
  referencia: z.string().min(3, 'Ingresa una referencia'),
  plan_contratar: z.string().min(1, 'El plan es requerido'),
  mesh: z.coerce.number().int().min(0).max(20),
  win_box: z.coerce.number().int().min(0).max(20),
  observaciones: z.string().optional().default(''),
  observaciones_back: z.string().optional().default(''),
  foto_dni: z.string().optional().default(''),
  foto_recibo: z.string().optional().default(''),
  foto_selfie: z.string().optional().default(''),
}).superRefine((values, context) => {
  const documentRules = {
    DNI: { regex: /^\d{8}$/, message: 'El DNI debe tener 8 digitos' },
    CE: { regex: /^\d{9,12}$/, message: 'El CE debe tener entre 9 y 12 digitos' },
    PASAPORTE: { regex: /^[A-Za-z0-9]{6,15}$/, message: 'El pasaporte debe tener entre 6 y 15 caracteres' },
  };
  const rule = documentRules[values.tipo_documento];
  if (!rule.regex.test(values.numero_documento)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['numero_documento'],
      message: rule.message,
    });
  }
});

export const userSchema = z.object({
  nombres: z.string().min(3, 'Ingresa nombres'),
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => (value.includes('@') ? value : `${value}@win.pe`))
    .pipe(z.string().email('Correo invalido').endsWith('@win.pe', 'El correo debe terminar en @win.pe')),
  correo_recuperacion: z
    .string()
    .trim()
    .toLowerCase()
    .email('Correo de recuperacion invalido'),
  rol: z.enum(['ADMIN', 'BACK', 'SUPERVISOR', 'ASESOR']),
  activo: z.boolean().default(true),
});

export type SaleFormValues = z.infer<typeof saleSchema>;
export type UserFormValues = z.infer<typeof userSchema>;
