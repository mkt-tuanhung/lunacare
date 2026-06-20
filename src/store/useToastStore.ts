import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  type: 'info',
  showToast: (message, type = 'info') => {
    set({ isVisible: true, message, type });
    // Tự động tắt sau 4 giây
    setTimeout(() => {
      set({ isVisible: false });
    }, 4000);
  },
  hideToast: () => set({ isVisible: false }),
}));
