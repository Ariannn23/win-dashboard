import { supabase } from '@/services/supabase/client';

const SALE_DOCUMENTS_BUCKET = 'venta-documentos';
const UPLOAD_TIMEOUT_MS = 15000;

export async function uploadSaleDocument(file: File, saleId: string, kind: string) {
  if (!supabase) {
    return URL.createObjectURL(file);
  }

  const extension = file.name.split('.').pop() ?? 'jpg';
  const filePath = `${saleId}/${kind}-${crypto.randomUUID()}.${extension}`;

  const uploadPromise = supabase.storage.from(SALE_DOCUMENTS_BUCKET).upload(filePath, file, {
    upsert: true,
  });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('La subida demoro demasiado. Intenta con una imagen mas liviana.')), UPLOAD_TIMEOUT_MS);
  });
  const { error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    throw new Error('No se pudo subir el documento. Revisa el bucket venta-documentos o sus permisos.');
  }

  const { data } = supabase.storage.from(SALE_DOCUMENTS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
