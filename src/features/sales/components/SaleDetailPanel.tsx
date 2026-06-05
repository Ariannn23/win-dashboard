import { Mail, MapPin, Phone, UserRound, Wifi, X } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { STATUS_LABELS } from '@/shared/lib/constants';
import { formatDate, formatDateOnly, initials } from '@/shared/lib/format';
import type { Profile, Sale } from '@/types';

interface SaleDetailPanelProps {
  sale: Sale;
  profiles: Profile[];
  onClose: () => void;
}

export function SaleDetailPanel({ sale, profiles, onClose }: SaleDetailPanelProps) {
  const getName = (id: string) => profiles.find((profile) => profile.id === id)?.nombres ?? 'Sin asignar';

  return (
    <Modal open onClose={onClose} className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(31,31,31,0.24)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8D8CC] bg-[#FFFCFA] px-7 py-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Detalle de venta</h2>
          <p className="mt-1 text-sm font-semibold text-[#6B625C]">VT-{new Date(sale.created_at).getFullYear()}-{sale.numero_documento.slice(-5)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Cerrar"
          className="grid h-10 w-10 place-items-center rounded-xl text-[#4B3024] hover:bg-[#FFF2E7]"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="hidden-scrollbar space-y-6 overflow-y-auto px-7 py-6">
        <section className="rounded-[20px] border border-[#E8B9A3] bg-[#FFF2E7] p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-[#FFD8CA] text-lg font-extrabold text-[#8C2D00]">
                {initials(sale.nombres_cliente)}
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#1F1F1F]">{sale.nombres_cliente}</p>
                <p className="mt-1 text-sm font-semibold text-[#6B625C]">
                  {sale.tipo_documento} {sale.numero_documento}
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-[#FFE2CC] px-4 py-2 text-xs font-extrabold text-[#A83B00]">
              {STATUS_LABELS[sale.estado]}
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard icon={Mail} label="Correo" value={sale.correo_cliente} />
          <InfoCard icon={Phone} label="Celular principal" value={sale.celular_principal} />
          <InfoCard icon={Phone} label="Celular referencia" value={sale.celular_referencia} />
          <InfoCard icon={UserRound} label="Titular linea" value={sale.titular_linea} />
          <InfoCard icon={UserRound} label="Lugar nacimiento" value={sale.lugar_nacimiento.charAt(0).toUpperCase() + sale.lugar_nacimiento.slice(1).toLowerCase()} />
          <InfoCard icon={UserRound} label="Fecha nacimiento" value={formatDateOnly(sale.fecha_nacimiento)} />
        </section>

        <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5">
          <h3 className="flex items-center gap-3 text-lg font-extrabold text-[#A32800]">
            <Wifi className="h-5 w-5" aria-hidden="true" />
            Servicio contratado
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <DetailItem label="Plan" value={sale.plan_contratar} />
            <DetailItem label="Mesh" value={String(sale.mesh)} />
            <DetailItem label="WinBox" value={String(sale.win_box)} />
            <DetailItem label="Asesor" value={getName(sale.asesor_id)} />
            <DetailItem label="Supervisor" value={getName(sale.supervisor_id)} />
            <DetailItem label="Creado" value={formatDate(sale.created_at)} />
          </div>
        </section>

        <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5">
          <h3 className="flex items-center gap-3 text-lg font-extrabold text-[#A32800]">
            <MapPin className="h-5 w-5" aria-hidden="true" />
            Direccion e instalacion
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailItem label="Direccion" value={sale.direccion} />
            <DetailItem label="Coordenadas" value={sale.coordenadas} />
            <DetailItem label="Distrito" value={sale.distrito} />
            <DetailItem label="Tipo vivienda" value={sale.tipo_vivienda} />
            <DetailItem label="Referencia" value={sale.referencia} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <TextBlock label="Observaciones" value={sale.observaciones || 'Sin observaciones'} />
          <TextBlock label="Observaciones Back Office" value={sale.observaciones_back || 'Sin observaciones internas'} />
        </section>

        {(sale.foto_dni || sale.foto_recibo || sale.foto_selfie) && (
          <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-5">
            <h3 className="flex items-center gap-3 text-lg font-extrabold text-[#A32800]">
              <UserRound className="h-5 w-5" aria-hidden="true" />
              Documentos adjuntos
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {sale.foto_dni && <ImagePreview label="Foto DNI" url={sale.foto_dni} />}
              {sale.foto_recibo && <ImagePreview label="Foto Recibo" url={sale.foto_recibo} />}
              {sale.foto_selfie && <ImagePreview label="Foto Selfie" url={sale.foto_selfie} />}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}

function ImagePreview({ label, url }: { label: string; url: string }) {
  return (
    <article className="rounded-[18px] border border-[#EDE4DC] bg-white p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8A7F78] mb-2">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[12px] border border-[#E8D8CC] hover:opacity-80 transition-opacity">
        <img src={url} alt={label} className="w-full h-32 object-cover" />
      </a>
    </article>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <article className="rounded-[18px] border border-[#EDE4DC] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#FFE2CC] text-[#C94A00]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8A7F78]">{label}</p>
          <p className="mt-1 text-sm font-extrabold text-[#1F1F1F]">{value}</p>
        </div>
      </div>
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8A7F78]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[18px] border border-[#EDE4DC] bg-white p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#8A7F78]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#4B3024]">{value}</p>
    </article>
  );
}
