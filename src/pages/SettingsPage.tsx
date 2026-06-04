import { Bell, Building2, Check, Save, Settings, Upload } from 'lucide-react';
import { useState } from 'react';
import { ComboBox } from '@/shared/ui/FormControls';
import { useToast } from '@/shared/ui/Toast';

type SettingsTab = 'EMPRESA' | 'PREFERENCIAS';

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Building2 }> = [
  { id: 'EMPRESA', label: 'Empresa', icon: Building2 },
  { id: 'PREFERENCIAS', label: 'Preferencias', icon: Bell },
];

export function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('EMPRESA');
  const [settings, setSettings] = useState({
    commercialName: 'Win Internet',
    businessName: 'Win Internet S.A.C.',
    ruc: '20612345678',
    email: 'contacto@win.pe',
    phone: '(01) 123 4567',
    address: 'Av. Los Proceres 123, Lima',
    currency: 'PEN',
    timezone: 'America/Lima',
    dateFormat: 'DD/MM/YYYY',
    emailNotifications: true,
    reportExport: true,
  });

  const update = (key: keyof typeof settings, value: string | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#FFF2E7] text-[#C94A00]">
          <Settings className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#1F1F1F]">Configuracion</h1>
          <p className="mt-1.5 text-sm font-semibold text-[#6B625C]">
            Administra los ajustes basicos del sistema.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-[20px] border border-[#EDE4DC] bg-white p-4 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
          <nav className="space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex h-12 w-full items-center gap-3 rounded-[14px] px-4 text-left text-sm font-extrabold transition ${
                  activeTab === id
                    ? 'bg-[#FFF2E7] text-[#C94A00] shadow-[inset_3px_0_0_#F24A00]'
                    : 'text-[#6B625C] hover:bg-[#FFFCFA] hover:text-[#C94A00]'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          {(activeTab === 'EMPRESA' || activeTab === 'PREFERENCIAS') && (
            <>
              {activeTab === 'EMPRESA' && (
                <SettingsCard title="Datos de la empresa">
                  <div className="grid gap-5 lg:grid-cols-[150px_1fr]">
                    <div>
                      <div className="grid h-[116px] place-items-center rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA]">
                        <div className="text-center">
                          <p className="text-[34px] font-extrabold tracking-[-0.08em] text-[#F24A00]">win</p>
                          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#6B625C]">Internet</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#E8D8CC] bg-white text-xs font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]"
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Cambiar logo
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Field label="Nombre comercial">
                        <input value={settings.commercialName} onChange={(event) => update('commercialName', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Razon social">
                        <input value={settings.businessName} onChange={(event) => update('businessName', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="RUC">
                        <input value={settings.ruc} onChange={(event) => update('ruc', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Correo principal">
                        <input type="email" value={settings.email} onChange={(event) => update('email', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Telefono">
                        <input value={settings.phone} onChange={(event) => update('phone', event.target.value)} className={inputClass} />
                      </Field>
                      <Field label="Direccion">
                        <input value={settings.address} onChange={(event) => update('address', event.target.value)} className={inputClass} />
                      </Field>
                    </div>
                  </div>
                </SettingsCard>
              )}

              {activeTab === 'PREFERENCIAS' && (
                <SettingsCard title="Preferencias basicas">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Moneda">
                      <div className="mt-2">
                        <ComboBox value={settings.currency} onChange={(value) => update('currency', value)} options={[{ value: 'PEN', label: 'Soles (PEN)' }, { value: 'USD', label: 'Dolares (USD)' }]} />
                      </div>
                    </Field>
                    <Field label="Zona horaria">
                      <div className="mt-2">
                        <ComboBox value={settings.timezone} onChange={(value) => update('timezone', value)} options={[{ value: 'America/Lima', label: '(GMT-05:00) Lima' }]} />
                      </div>
                    </Field>
                    <Field label="Formato de fecha">
                      <div className="mt-2">
                        <ComboBox value={settings.dateFormat} onChange={(value) => update('dateFormat', value)} options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }]} />
                      </div>
                    </Field>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-5">
                    <CheckField checked={settings.emailNotifications} onChange={(value) => update('emailNotifications', value)} label="Recibir notificaciones por correo" />
                    <CheckField checked={settings.reportExport} onChange={(value) => update('reportExport', value)} label="Permitir exportar reportes" />
                  </div>
                </SettingsCard>
              )}

            </>
          )}
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-[#E8D8CC] pt-5">
        <button type="button" className="h-12 min-w-[160px] rounded-[14px] border border-[#E8D8CC] bg-white px-6 text-sm font-extrabold text-[#4B3024] hover:bg-[#FFF2E7]">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => showToast({ title: 'Configuracion guardada', detail: 'Los ajustes basicos quedaron actualizados.', tone: 'success' })}
          className="flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#F24A00] to-[#C94A00] px-6 text-sm font-extrabold text-white shadow-[0_14px_22px_rgba(201,74,0,0.22)]"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

const inputClass =
  'mt-2 h-12 w-full rounded-[14px] border border-[#E8D8CC] bg-white px-4 text-sm font-semibold text-[#1F1F1F] outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70';

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#EDE4DC] bg-white p-6 shadow-[0_14px_34px_rgba(91,47,20,0.045)]">
      <h2 className="text-lg font-extrabold text-[#1F1F1F]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#4B3024]">{label}</span>
      {children}
    </label>
  );
}

function CheckField({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#4B3024]">
      <span className={`grid h-5 w-5 place-items-center rounded-[6px] ${checked ? 'bg-[#F24A00] text-white' : 'border border-[#E8D8CC] bg-white'}`}>
        {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
      {label}
    </label>
  );
}
