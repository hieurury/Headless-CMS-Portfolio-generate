import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  // Alert
  visible: boolean;
  message: string;
  type: AlertType;
  showAlert: (message: string, type?: AlertType, timeout?: number) => void;
  hideAlert: () => void;

  // Confirm
  confirmState: {
    visible: boolean;
    message: string;
    resolve: ((value: boolean) => void) | null;
  };
  showConfirm: (message: string) => Promise<boolean>;
  resolveConfirm: (value: boolean) => void;
}

export const useAlertStore = create<AlertState>()((set) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    visible: false,
    message: '',
    type: 'info',

    showAlert: (message, type = 'info', timeout = 4000) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      set({ visible: true, message, type });
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          set({ visible: false });
        }, timeout);
      }
    },

    hideAlert: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      set({ visible: false });
    },

    confirmState: {
      visible: false,
      message: '',
      resolve: null,
    },

    showConfirm: (message: string) => {
      return new Promise<boolean>((resolve) => {
        set({
          confirmState: { visible: true, message, resolve },
        });
      });
    },

    resolveConfirm: (value: boolean) => {
      set((state) => {
        if (state.confirmState.resolve) {
          state.confirmState.resolve(value);
        }
        return {
          confirmState: { visible: false, message: '', resolve: null },
        };
      });
    },
  };
});
