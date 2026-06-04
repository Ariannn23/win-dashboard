import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useContext, useMemo, useState } from 'react';

type ToastTone = 'success' | 'info' | 'warning' | 'error';

interface ToastMessage {
  id: string;
  title: string;
  detail?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (message: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setMessages((current) => [{ ...message, id }, ...current].slice(0, 4));
    window.setTimeout(() => {
      setMessages((current) => current.filter((item) => item.id !== id));
    }, 3600);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-5 z-[1200] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-3">
        {messages.map((message) => (
          <ToastCard key={message.id} message={message} onClose={() => setMessages((current) => current.filter((item) => item.id !== message.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast debe usarse dentro de ToastProvider');
  return value;
}

function ToastCard({ message, onClose }: { message: ToastMessage; onClose: () => void }) {
  const tones = {
    success: 'border-[#BFEED3] bg-[#F2FFF7] text-[#009A4E]',
    info: 'border-[#D4E7FF] bg-[#F5FAFF] text-[#005DE8]',
    warning: 'border-[#FFE1A8] bg-[#FFF9EA] text-[#A86400]',
    error: 'border-[#FFD0D0] bg-[#FFF5F5] text-[#D64545]',
  };
  const Icon = message.tone === 'success' ? CheckCircle2 : message.tone === 'error' ? AlertTriangle : Info;

  return (
    <article className={`flex gap-3 rounded-[16px] border p-4 shadow-[0_18px_42px_rgba(31,31,31,0.14)] backdrop-blur ${tones[message.tone]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-[#1F1F1F]">{message.title}</p>
        {message.detail && <p className="mt-1 text-xs font-semibold leading-5 text-[#6B625C]">{message.detail}</p>}
      </div>
      <button type="button" onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] text-[#6B625C] hover:bg-white/70" title="Cerrar">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
