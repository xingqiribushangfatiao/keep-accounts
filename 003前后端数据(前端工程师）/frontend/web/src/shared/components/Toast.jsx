import { createContext, useCallback, useContext, useState } from 'react';

/**
 * 极简 Toast:error / success 两种
 *  - 用法:<ToastProvider>{children}</ToastProvider>
 *        const { showToast } = useToast();
 *        showToast({ type:'error', message:'密码错误' });
 */
const ToastContext = createContext(null);

let id = 0;

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);

  const showToast = useCallback(({ type = 'success', message, duration = 2400 }) => {
    const tid = ++id;
    setList((arr) => [...arr, { tid, type, message }]);
    setTimeout(() => {
      setList((arr) => arr.filter((t) => t.tid !== tid));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none px-4 w-full max-w-sm">
        {list.map((t) => (
          <div
            key={t.tid}
            className={[
              'pointer-events-auto rounded-2xl px-4 py-3 text-sm shadow-level-2',
              t.type === 'error'   ? 'bg-error text-on-error'           : '',
              t.type === 'success' ? 'bg-income-teal text-white'        : '',
              !['error','success'].includes(t.type) ? 'bg-surface-white text-on-surface border border-border-blush' : '',
            ].join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
