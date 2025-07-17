import { create } from 'zustand';
import { supabaseApi, User, OrderWithItems } from '@/lib/supabase';

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedUser: User | null;
  userOrders: OrderWithItems[];
  ordersLoading: boolean;
  fetchUsers: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedUser: (user: User | null) => void;
  fetchUserOrders: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedUser: null,
  userOrders: [],
  ordersLoading: false,

  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });

      const { searchTerm } = get();
      const users = await supabaseApi.getUsers(searchTerm || undefined);

      set({ users, loading: false });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        loading: false,
      });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    // Debounce search - fetch after a delay
    setTimeout(() => {
      if (get().searchTerm === term) {
        get().fetchUsers();
      }
    }, 300);
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
    if (user) {
      get().fetchUserOrders(user.id);
    } else {
      set({ userOrders: [] });
    }
  },

  fetchUserOrders: async (userId: string) => {
    try {
      set({ ordersLoading: true });

      const orders = await supabaseApi.getUserOrders(userId);

      set({ userOrders: orders, ordersLoading: false });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      set({ userOrders: [], ordersLoading: false });
    }
  },

  refreshData: async () => {
    await get().fetchUsers();
  },
}));
