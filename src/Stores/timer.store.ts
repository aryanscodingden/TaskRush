import { create } from "zustand"; // updated

type TimerState = {
  taskId: string | null;
  taskTitle: string | null;
  expectedMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  startedAt: number | null;
  finished: boolean;

  start: (taskId: string, title: string, expected: number) => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  finish: () => void;
  reset: () => void;
};

export const useTimerStore = create<TimerState>((set, get) => ({
  taskId: null,
  taskTitle: null,
  expectedMinutes: 0,
  remainingSeconds: 0,
  totalSeconds: 0,
  isRunning: false,
  startedAt: null,
  finished: false,

  start: (taskId, title, expected) => {
    const sec = expected * 60;

    set({
      taskId,
      taskTitle: title,
      expectedMinutes: expected,
      remainingSeconds: sec,
      totalSeconds: sec,
      isRunning: true,
      startedAt: Date.now(),
      finished: false,
    });
  },

  pause: () => set({ isRunning: false }),
  resume: () => set({ isRunning: true }),

  tick: () => {
    const s = get();
    if (!s.isRunning || s.remainingSeconds <= 0) return;

    const newRemain = s.remainingSeconds - 1;

    set({ remainingSeconds: newRemain });

    if (newRemain <= 0) {
      set({ isRunning: false, finished: true });
    }
  },

  finish: () => {
    set({ isRunning: false, finished: true });
  },

  reset: () =>
    set({
      taskId: null,
      finished: false,
      remainingSeconds: 0,
      taskTitle: null,
      expectedMinutes: 0,
      isRunning: false,
    }),
}));
