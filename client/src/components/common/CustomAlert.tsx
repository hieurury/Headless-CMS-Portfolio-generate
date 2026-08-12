import React from 'react';
import { useAlertStore } from '../../store/alertStore';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { t } from '../../i18n';

export const CustomAlert: React.FC = () => {
  const { visible, message, type, hideAlert, confirmState, resolveConfirm } = useAlertStore();
  const { language } = useUIStore();
  const tr = t(language).common;
  const titleStr = language === 'vi' ? 'Xác nhận' : 'Confirm';

  // Icons based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'error':
        return <XCircle size={18} className="text-rose-500" />;
      case 'info':
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <>
      {/* Toast Alert */}
      {visible && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div 
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] shadow-xl rounded-b-md animate-slide-down border-none max-w-md w-max"
          >
            <div className="shrink-0">{getIcon()}</div>
            <p className="text-sm font-medium text-[var(--color-text)] m-0">{message}</p>
            <button 
              onClick={hideAlert} 
              className="shrink-0 ml-2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded transition-colors bg-transparent border-none cursor-pointer flex"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmState.visible && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-0 px-4 pb-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-[var(--color-surface)] rounded-b-md shadow-2xl border border-[var(--color-border)] p-6 max-w-sm w-full animate-slide-down"
          >
            <h3 className="text-lg font-semibold text-[var(--color-text)] mt-0 mb-3">{titleStr}</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0 mb-6">{confirmState.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-md transition-colors border-none cursor-pointer"
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-bg)] bg-[var(--color-text)] hover:opacity-90 rounded-md transition-opacity border-none cursor-pointer"
              >
                {tr.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
