import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

type Tone = 'default' | 'danger';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((raw: ConfirmOptions | string) => {
    const normalized: ConfirmOptions =
      typeof raw === 'string' ? { message: raw } : raw;
    return new Promise<boolean>((resolve) => {
      setOpts({
        title: 'Konfirmasi',
        message: 'Apakah kamu yakin?',
        confirmLabel: 'Ya, Lanjutkan',
        cancelLabel: 'Batal',
        tone: 'default',
        ...normalized,
      });
      setResolver(() => resolve);
    });
  }, []);

  const close = (result: boolean) => {
    if (resolver) resolver(result);
    setResolver(null);
    setOpts(null);
  };

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  const isDanger = opts?.tone === 'danger';

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {opts && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative z-10"
            >
              <button
                onClick={() => close(false)}
                className="absolute top-5 right-5 p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                  isDanger ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{opts.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{opts.message}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => close(false)}
                  className="flex-1 py-3 px-5 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 uppercase text-xs tracking-widest"
                >
                  {opts.cancelLabel}
                </button>
                <button
                  onClick={() => close(true)}
                  className={`flex-[1.5] py-3 px-5 font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl ${
                    isDanger
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                  }`}
                >
                  {opts.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return async () => window.confirm('Apakah kamu yakin?');
  }
  return ctx.confirm;
}
