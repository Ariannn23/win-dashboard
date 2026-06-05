import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadSaleDocument } from '@/services/storage/saleDocuments';
import { FieldError } from '@/shared/ui/FormControls';

interface FileFieldProps {
  label: string;
  kind: string;
  saleId: string;
  value?: string;
  onChange: (url: string) => void;
}

export function FileField({ label, kind, saleId, value, onChange }: FileFieldProps) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Solo se permiten imagenes o PDF.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError('El archivo no debe superar 6 MB.');
      return;
    }
    setError('');
    setFileName(file.name);
    setLoading(true);
    try {
      const url = await uploadSaleDocument(file, saleId, kind);
      onChange(url);
    } catch (uploadError) {
      setFileName('');
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudo subir el archivo.');
    } finally {
      setLoading(false);
    }
  }

  const labelText = loading
    ? 'Subiendo archivo...'
    : value
      ? fileName || 'Archivo cargado'
      : fileName || 'Seleccionar archivo';

  return (
    <div className="block min-w-0">
      <span className="text-sm font-semibold text-[#4B3024]">{label}</span>
      <div className="mt-2 rounded-[14px] border border-[#E8D8CC] bg-white p-2">
        <div className="flex min-h-11 items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FFF2E7] text-[#C94A00] transition hover:bg-[#FFE2CC] disabled:cursor-wait disabled:opacity-70"
            title={loading ? 'Subiendo archivo' : 'Seleccionar archivo'}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#1F1F1F]">{labelText}</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#8A7F78]">
              JPG, PNG, WEBP o PDF hasta 6 MB
            </p>
          </div>
          {value && !loading ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#009A4E]" aria-hidden="true" />
          ) : null}
          {(value || fileName) && !loading ? (
            <button
              type="button"
              onClick={() => {
                setFileName('');
                setError('');
                onChange('');
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-[#8A7F78] hover:bg-[#FFF2E7] hover:text-[#C94A00]"
              title="Quitar archivo"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          disabled={loading}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
