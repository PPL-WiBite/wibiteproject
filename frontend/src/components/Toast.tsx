import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idCounter;
      setItems((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      info: (m) => show(m, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const styles: Record<ToastType, { bg: string; icon: JSX.Element; ring: string }> = {
    success: {
      bg: 'bg-white border-emerald-100',
      ring: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    error: {
      bg: 'bg-white border-red-100',
      ring: 'bg-red-500',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    },
    info: {
      bg: 'bg-white border-slate-100',
      ring: 'bg-slate-900',
      icon: <Info className="w-5 h-5 text-slate-500" />,
    },
  };

  const s = styles[item.type];

  // Reset timer pause on hover bisa nyusul; default: auto-dismiss dari provider.
  useEffect(() => {}, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`pointer-events-auto relative flex items-start gap-3 pl-5 pr-3 py-4 rounded-2xl border shadow-xl shadow-slate-900/5 ${s.bg}`}
    >
      <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${s.ring}`} />
      <div className="shrink-0 mt-0.5">{s.icon}</div>
      <p className="flex-1 text-sm text-slate-700 font-medium leading-relaxed">{item.message}</p>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
        aria-label="Tutup"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback noop jika provider belum mount
    return {
      show: (m) => console.info('[toast]', m),
      success: (m) => console.info('[toast:success]', m),
      error: (m) => console.warn('[toast:error]', m),
      info: (m) => console.info('[toast:info]', m),
    };
  }
  return ctx;
}
