import { create } from "zustand";
import { List } from "../Services/tasks.service";

interface ListsState {
  lists: List[];
  selectedListId: string | null;
  loading: boolean;
  setLists: (lists: List[]) => void;
  addList: (list: List) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  removeList: (id: string) => void;
  selectList: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useLists = create<ListsState>((set) => ({
  lists: [],
  selectedListId: null,
  loading: false,

  setLists: (lists) => set({ lists }),
  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  updateList: (id, updates) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, ...updates } : list
      ),
    })),
  removeList: (id) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
    })),
  selectList: (id) => set({ selectedListId: id }),
  setLoading: (loading) => set({ loading }),
}));
