import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Business, AISettings, Subscription, Lead } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

interface AppState {
  business: Business | null;
  settings: AISettings | null;
  subscription: Subscription | null;
  setBusiness: (business: Business | null) => void;
  setSettings: (settings: AISettings | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  business: null,
  settings: null,
  subscription: null,
  setBusiness: (business) => set({ business }),
  setSettings: (settings) => set({ settings }),
  setSubscription: (subscription) => set({ subscription }),
}));

interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  setSelectedLead: (lead: Lead | null) => void;
}

export const useLeadsStore = create<LeadsState>()((set) => ({
  leads: [],
  selectedLead: null,
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
  updateLead: (id, data) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),
  removeLead: (id) =>
    set((state) => ({ leads: state.leads.filter((l) => l.id !== id) })),
  setSelectedLead: (lead) => set({ selectedLead: lead }),
}));

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    { name: 'ui-storage' }
  )
);