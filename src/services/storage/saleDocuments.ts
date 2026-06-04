import { supabase } from '@/services/supabase/client';

const SALE_DOCUMENTS_BUCKET = 'venta-documentos';

export async function uploadSaleDocument(file: File, saleId: string, kind: string) {
  if (!supabase) {
    return URL.createObjectURL(file);
  }

  const extension = file.name.split('.').pop() ?? 'jpg';
  const filePath = `${saleId}/${kind}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(SALE_DOCUMENTS_BUCKET).upload(filePath, file, {
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(SALE_DOCUMENTS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
