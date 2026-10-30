"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastMsg {
  texto: string;
  desfazer?: () => void;
}

const Ctx = createContext<(t: ToastMsg) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((t: ToastMsg) => {
    clearTimeout(timer.current);
    setMsg(t);
    timer.current = setTimeout(() => setMsg(null), 6000);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
          <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white shadow-lg">
            <span>{msg.texto}</span>
            {msg.desfazer && (
              <button
                className="font-semibold text-emerald-300"
                onClick={() => {
                  msg.desfazer?.();
                  setMsg(null);
                }}
              >
                Desfazer
              </button>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
