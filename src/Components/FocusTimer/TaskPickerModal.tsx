import React from "react";
import { BlurFade } from "../UI/BlurFade";
import { useTasks } from "@/Stores/tasks.store";
import { useTimerStore } from "@/Stores/timer.store";

interface TaskPickerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TaskPickerModal({
  open,
  onClose,
}: TaskPickerModalProps) {
  const { tasks } = useTasks();

  if (!open) return null;

  const handlePick = (task: any) => {
    useTimerStore
      .getState()
      .start(task.id, task.title, task.estimated_minutes ?? 25);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <BlurFade className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full border-2 border-white/30">
        <h3 className="text-lg font-bold text-white mb-4">Choose a task.</h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.length === 0 && (
            <p className="text-sm text-zinc-300 text-center">
              No tasks available, please first create a task.
            </p>
          )}

          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handlePick(task)}
              className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900/50 text-white hover:bg-white/20 transition font-medium"
            >
              {task.title}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition"
        >
          Cancel
        </button>
      </BlurFade>
    </div>
  );
}
