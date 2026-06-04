import { Upload } from 'lucide-react';
import { useState } from 'react';
import { uploadSaleDocument } from '@/services/storage/saleDocuments';

interface FileFieldProps {
  label: string;
  kind: string;
  saleId: string;
  value?: string;
  onChange: (url: string) => void;
}

export function FileField({ label, kind, saleId, value, onChange }: FileFieldProps) {
  const [loading, setLoading] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadSaleDocument(file, saleId, kind);
      onChange(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#4B3024]">{label}</span>
      <span className="mt-2 flex h-12 cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold text-[#6B625C] transition hover:border-[#FF7A1A] hover:bg-[#FFFCFA]">
        <span className="truncate">{loading ? 'Cargando...' : value ? 'Archivo cargado' : 'Seleccionar archivo'}</span>
        <Upload className="h-4 w-4 shrink-0 text-[#C94A00]" aria-hidden="true" />
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          disabled={loading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </span>
    </label>
  );
}
