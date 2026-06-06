import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import type { Profile, Sale, StatusHistory } from '@/types';
import type {
  CrmDataService,
  CrmSnapshot,
  SaleUpsertPayload,
  StatusChangeResult,
} from './types';
import type { ProfileUpsertPayload } from '@/types';

function requireSupabase() {
  if (!supabase) throw new Error('Supabase no esta configurado');
  return supabase;
}

function normalizeProfile(row: Profile): Profile {
  return {
    ...row,
    correo_recuperacion: row.correo_recuperacion ?? '',
  };
}

function historyWithNames(rows: Array<Omit<StatusHistory, 'usuario_nombre'>>, profiles: Profile[]): StatusHistory[] {
  return rows.map((row) => ({
    ...row,
    usuario_nombre: profiles.find((profile) => profile.id === row.usuario_id)?.nombres ?? 'Usuario',
  }));
}

function salePayload(payload: SaleUpsertPayload) {
  return {
    id: payload.id,
    estado: payload.estado,
    asesor_id: payload.asesor_id,
    supervisor_id: payload.supervisor_id,
    creado_por: payload.creado_por,
    nombres_cliente: payload.nombres_cliente,
    tipo_documento: payload.tipo_documento,
    numero_documento: payload.numero_documento,
    fecha_nacimiento: payload.fecha_nacimiento,
    lugar_nacimiento: payload.lugar_nacimiento,
    correo_cliente: payload.correo_cliente,
    celular_principal: payload.celular_principal,
    celular_referencia: payload.celular_referencia,
    titular_linea: payload.titular_linea,
    direccion: payload.direccion,
    coordenadas: payload.coordenadas,
    tipo_vivienda: payload.tipo_vivienda,
    distrito: payload.distrito,
    referencia: payload.referencia,
    plan_contratar: payload.plan_contratar,
    meses: payload.meses,
    mesh: payload.mesh,
    win_box: payload.win_box,
    observaciones: payload.observaciones,
    observaciones_back: payload.observaciones_back,
    foto_dni: payload.foto_dni,
    foto_recibo: payload.foto_recibo,
    foto_selfie: payload.foto_selfie,
  };
}

function crmErrorMessage(message: string) {
  const messages: Record<string, string> = {
    solo_back_admin_cambia_estados: 'Solo Admin o Back office pueden cambiar estados.',
    flujo_estado_invalido: 'El estado debe avanzar al siguiente paso permitido o cerrar el flujo.',
    venta_no_encontrada: 'Venta no encontrada.',
    usuario_sin_perfil: 'Tu usuario no tiene un perfil activo.',
  };

  return messages[message] ?? message;
}

async function loadHistory(snapshotProfiles: Profile[]) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('historial_estados')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return historyWithNames((data ?? []) as Array<Omit<StatusHistory, 'usuario_nombre'>>, snapshotProfiles);
}

export const supabaseCrmService: CrmDataService = {
  async loadSnapshot(): Promise<CrmSnapshot> {
    const client = requireSupabase();
    const [profilesResult, salesResult] = await Promise.all([
      client.from('perfiles').select('*').order('created_at', { ascending: true }),
      client.from('ventas').select('*').order('created_at', { ascending: false }),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (salesResult.error) throw salesResult.error;

    const profiles = ((profilesResult.data ?? []) as Profile[]).map(normalizeProfile);
    const history = await loadHistory(profiles);

    return {
      profiles,
      sales: (salesResult.data ?? []) as Sale[],
      history,
    };
  },

  async upsertSale(payload: SaleUpsertPayload) {
    const client = requireSupabase();
    const { data, error } = await client
      .from('ventas')
      .upsert(salePayload(payload))
      .select('*')
      .single();

    if (error) throw new Error(crmErrorMessage(error.message));
    return data as Sale;
  },

  async changeSaleStatus(
    saleId,
    nextStatus,
    user,
    comentario,
    snapshot,
  ): Promise<StatusChangeResult> {
    const client = requireSupabase();
    const { data, error } = await client.rpc('cambiar_estado_venta', {
      p_venta_id: saleId,
      p_estado: nextStatus,
      p_comentario: comentario,
    });

    if (error) throw new Error(crmErrorMessage(error.message));

    const { data: latestHistory, error: historyError } = await client
      .from('historial_estados')
      .select('*')
      .eq('venta_id', saleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (historyError) throw historyError;

    const history = latestHistory
      ? historyWithNames([latestHistory as Omit<StatusHistory, 'usuario_nombre'>], snapshot.profiles)[0]
      : undefined;

    return {
      sale: data as Sale,
      history:
        history && history.usuario_id === user.id
          ? history
          : history
            ? { ...history, usuario_nombre: snapshot.profiles.find((profile) => profile.id === history.usuario_id)?.nombres ?? user.nombres }
            : undefined,
    };
  },

  async upsertProfile(payload: ProfileUpsertPayload, snapshot: CrmSnapshot) {
    const client = requireSupabase();
    const existing = payload.id ? snapshot.profiles.find((profile) => profile.id === payload.id) : undefined;

    if (!existing) {
      if (!payload.password) throw new Error('Se requiere contraseña para crear un usuario nuevo.');
      
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: payload.correo,
        password: payload.password,
        options: {
          data: {
            full_name: payload.nombres,
            name: payload.nombres,
          },
        },
      });

      if (authError) throw new Error(`Error creando usuario: ${authError.message}`);
      if (!authData.user) throw new Error('No se pudo crear el usuario.');

      const { data: newProfile, error: fetchError } = await client
        .from('perfiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (fetchError) {
        // If the profile wasn't auto-created via triggers, let's insert it
        const { data: inserted, error: insertError } = await client
          .from('perfiles')
          .insert({
            id: authData.user.id,
            nombres: payload.nombres,
            dni: payload.dni ?? '',
            correo: payload.correo,
            correo_recuperacion: payload.correo_recuperacion,
            direccion: payload.direccion,
            fecha_nacimiento: payload.fecha_nacimiento,
            celular: payload.celular,
            rol: payload.rol,
            activo: payload.activo,
            supervisor_id: payload.supervisor_id,
          })
          .select('*')
          .single();

        if (insertError) throw insertError;
        return normalizeProfile(inserted as Profile);
      }
      
      // Update the auto-created profile if it exists
      const { data: updated, error: updateError } = await client
        .from('perfiles')
        .update({
          nombres: payload.nombres,
          dni: payload.dni ?? '',
          correo_recuperacion: payload.correo_recuperacion,
          direccion: payload.direccion,
          fecha_nacimiento: payload.fecha_nacimiento,
          celular: payload.celular,
          rol: payload.rol,
          activo: payload.activo,
          supervisor_id: payload.supervisor_id,
        })
        .eq('id', authData.user.id)
        .select('*')
        .single();

      if (updateError) throw updateError;
      return normalizeProfile(updated as Profile);
    }

    const { data, error } = await client
      .from('perfiles')
      .update({
        nombres: payload.nombres,
        correo: payload.correo,
        correo_recuperacion: payload.correo_recuperacion,
        direccion: payload.direccion,
        fecha_nacimiento: payload.fecha_nacimiento,
        celular: payload.celular,
        rol: payload.rol,
        activo: payload.activo,
        supervisor_id: payload.supervisor_id,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeProfile(data as Profile);
  },

  async toggleProfile(id: string) {
    const client = requireSupabase();
    const { data: current, error: currentError } = await client
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    if (currentError) throw currentError;

    const { data, error } = await client
      .from('perfiles')
      .update({ activo: !current.activo })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeProfile(data as Profile);
  },
};
