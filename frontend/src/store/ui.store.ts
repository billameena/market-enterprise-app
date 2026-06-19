import { create } from 'zustand';

interface Modal {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIStore {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  modals: Modal[];
  toasts: Toast[];
  isSearchOpen: boolean;

  // Sidebar
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Mobile Menu
  openMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Search
  openSearch: () => void;
  closeSearch: () => void;

  // Modals
  openModal: (modal: Modal) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  modals: [],
  toasts: [],
  isSearchOpen: false,

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openModal: (modal) =>
    set((state) => ({ modals: [...state.modals, modal] })),

  closeModal: (id) =>
    set((state) => ({ modals: state.modals.filter((m) => m.id !== id) })),

  closeAllModals: () => set({ modals: [] }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
