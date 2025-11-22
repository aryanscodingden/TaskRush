import { create } from 'zustand';
import { Task } from '../Services/tasks.service';

interface TasksState {
    tasks: Task[];
    loading: boolean;
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    removeTask: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useTasks = create<TasksState>((set) => ({
  tasks: [],
  loading: false,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));


