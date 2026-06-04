import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export function ComboBox({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] px-4 text-left text-sm font-semibold text-[#1F1F1F] outline-none transition hover:border-[#FFB48A] focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70 disabled:cursor-not-allowed disabled:bg-[#F3EAE3] disabled:text-[#8A7F78]"
      >
        <span className={selected ? 'truncate' : 'truncate text-[#8A7F78]'}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#6B625C] transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-50 max-h-64 overflow-y-auto rounded-[14px] border border-[#E8D8CC] bg-white p-1.5 shadow-[0_18px_45px_rgba(91,47,20,0.16)]">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-[10px] px-3 text-left text-sm font-semibold transition ${
                  active ? 'bg-[#FFF2E7] text-[#C94A00]' : 'text-[#4B3024] hover:bg-[#FFFCFA]'
                }`}
              >
                <span>{option.label}</span>
                {active && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DateControl({
  value,
  onChange,
  min,
  placeholder = 'Seleccionar fecha',
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const rootRef = useRef<HTMLDivElement | null>(null);
  const minDate = min ? new Date(`${min}T00:00:00`) : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const label = selectedDate
    ? new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selectedDate)
    : placeholder;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const pickDay = (day: number) => {
    const picked = new Date(year, month, day);
    const iso = `${picked.getFullYear()}-${String(picked.getMonth() + 1).padStart(2, '0')}-${String(picked.getDate()).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-[14px] border border-[#E8D8CC] bg-[#FFFCFA] px-4 text-left text-sm font-semibold text-[#1F1F1F] outline-none transition hover:border-[#FFB48A] focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FFE2CC]/70"
      >
        <span className={value ? '' : 'text-[#8A7F78]'}>{label}</span>
        <Calendar className="h-4 w-4 text-[#6B625C]" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.45rem)] z-50 w-[292px] rounded-[16px] border border-[#E8D8CC] bg-white p-3 shadow-[0_18px_45px_rgba(91,47,20,0.16)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-[10px] text-[#6B625C] hover:bg-[#FFF2E7]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-extrabold text-[#1F1F1F]">
              {new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(viewDate)}
            </p>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-[10px] text-[#6B625C] hover:bg-[#FFF2E7]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-[#8A7F78]">
            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const cellDate = new Date(year, month, day);
              const disabled = minDate ? cellDate < minDate : false;
              const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const active = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => pickDay(day)}
                  className={`grid h-9 place-items-center rounded-[10px] text-xs font-extrabold transition ${
                    active
                      ? 'bg-[#C94A00] text-white shadow-[0_8px_14px_rgba(201,74,0,0.18)]'
                      : 'text-[#4B3024] hover:bg-[#FFF2E7]'
                  } disabled:cursor-not-allowed disabled:text-[#D8CCC4] disabled:hover:bg-transparent`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="mt-1.5 block rounded-[10px] bg-[#FFF1F1] px-3 py-2 text-xs font-bold text-[#D64545]">
      {message}
    </span>
  );
}
