import create from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,

  setUser: (user, token) => {
    set({ user, token });
    if (token) {
      localStorage.setItem('token', token);
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  setLoading: (loading) => set({ loading }),
}));

export const useDebtStore = create((set) => ({
  debts: [],
  selectedDebt: null,
  filter: null, // null, true (pagadas), false (pendientes)
  loading: false,

  setDebts: (debts) => set({ debts }),
  setSelectedDebt: (debt) => set({ selectedDebt: debt }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),

  addDebt: (debt) =>
    set((state) => ({
      debts: [debt, ...state.debts],
    })),

  removeDebt: (debtId) =>
    set((state) => ({
      debts: state.debts.filter((d) => d.id !== debtId),
    })),

  updateDebtInStore: (updatedDebt) =>
    set((state) => ({
      debts: state.debts.map((d) =>
        d.id === updatedDebt.id ? updatedDebt : d
      ),
    })),
}));
