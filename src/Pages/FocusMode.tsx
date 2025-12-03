import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ChevronLeft } from "lucide-react";
import { GradientBackground } from "@/Components/UI/GradientBackground";
import GlassButtonSwitch from "@/Components/UI/GlassToggle";
import TaskPickerModal from "@/Components/FocusTimer/TaskPickerModal";
import { useTimerStore } from "@/Stores/timer.store";
import { toggleTaskComplete } from "@/Services/tasks.service";
import { useTasks } from "@/Stores/tasks.store";
import { supabase } from "@/Services/supabase";
import LofiPlayer from "@/Components/FocusTimer/LofiPlayer";

type FocusModeProps = {
  onBackToTasks: () => void;
};

export default function FocusMode({ onBackToTasks }: FocusModeProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { updateTask } = useTasks();
  const {
    taskId,
    taskTitle,
    expectedMinutes,
    remainingSeconds,
    isRunning,
    pause,
    resume,
    reset,
    start,
    tick,
    finish,
  } = useTimerStore();
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    const loadBg = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const cached = localStorage.getItem("focusBackground");
        if (cached) setBgImage(cached);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("focus_bg")
        .eq("id", session.user.id)
        .single();

      if (data?.focus_bg) {
        setBgImage(data.focus_bg);
      } else {
        const cached = localStorage.getItem("focusBackground");
        if (cached) setBgImage(cached);
      }
    };
    loadBg();
  }, []);

  useEffect(() => {
    if (!taskTitle) {
      setPickerOpen(true);
    }
  }, [taskTitle]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  useEffect(() => {
    if (remainingSeconds === 0 && taskTitle && taskId) {
      toggleTaskComplete(taskId, true)
        .then(() => {
          updateTask(taskId, {
            is_completed: true,
            completed_at: new Date().toISOString(),
          });
        })
        .catch((err) => console.error("Failed to complete task:", err));

      const audio = new Audio("/complete.mp3");
      audio.play().catch(() => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Timer Complete!", {
            body: `${taskTitle} session finished!`,
            icon: "/logo192.png",
          });
        }
      });
    }
  }, [remainingSeconds, taskTitle, taskId, updateTask]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Upload to Supabase
      const userId = session.user.id;
      const ext = file.name.split(".").pop();
      const fileName = `bg-${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("backgrounds")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("backgrounds")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      await supabase
        .from("profiles")
        .update({ focus_bg: imageUrl })
        .eq("id", userId);

      setBgImage(imageUrl);
    } else {
      // No session, use local storage
      const url = URL.createObjectURL(file);
      setBgImage(url);
      localStorage.setItem("focusBackground", url);
    }
  };

  const resetBackground = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase
        .from("profiles")
        .update({ focus_bg: null })
        .eq("id", session.user.id);
    }
    
    setBgImage(null);
    localStorage.removeItem("focusBackground");
  };

  const spentMinutes =
    expectedMinutes * 60 > 0
      ? Math.ceil((expectedMinutes * 60 - remainingSeconds) / 60)
      : 0;

  const progressPercentage =
    expectedMinutes > 0 ? (remainingSeconds / (expectedMinutes * 60)) * 100 : 0;

  return (
    <div className="h-screen w-full bg-zinc-950 text-white p-6 flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {bgImage ? (
          <img
            src={bgImage}
            alt="Focus Background"
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <GradientBackground />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center">
        <LofiPlayer />

    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
    <label className="px-4 py-2 bg-white/20 backdrop-blur-md text-sm text-white rounded-xl cursor-pointer hover:bg-white/30 transition">
        Change Background
        <input 
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBackgroundUpload}
            />
    </label>

    {bgImage && (
        <button
            onClick={resetBackground}
            className="px-4 py-2 bg-red-500/80 backdrop-blur-md text-sm rounded-xl hover:bg-red-500 transition"
            >
                Reset
            </button>
    )}
    </div>
        <TaskPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
        />
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <GlassButtonSwitch
            current="Focus"
            onSwitch={(mode) => {
              if (mode === "Todo") {
                onBackToTasks();
              }
            }}
          />
        </div>

        <button
          onClick={() => setPickerOpen(true)}
          className="absolute top-6 right-6 px-4 py-2 text-black font-semibold bg-white rounded-xl hover:opacity-90 transition"
        >
          Choose Task
        </button>

        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="text-7xl font-black tabular-nums text-white drop-shadow-xl">
            {formatTime(remainingSeconds)}
          </div>
          {taskTitle && (
            <div className="text-lg font-semibold text-white/80 text-center max-w-xs truncate drop-shadow">
              {taskTitle}
            </div>
          )}

          <div className="w-65 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transistion-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center gap-4">
            {!isRunning ? (
              <button
                onClick={resume}
                className="px-6 py-3 bg-green-500 rounded-xl flex items-center gap-2 font-semibold text-black"
              >
                <Play size={16} />
                Start
              </button>
            ) : (
              <button
                onClick={pause}
                className="px-6 py-3 bg-red-500 rounded-xl flex items-center gap-2 font-semibold text-black"
              >
                <Pause size={16} />
                Pause
              </button>
            )}
            <button
              onClick={reset}
              className="px-6 py-3 bg-white/20 rounded-xl flex items-center gap-2 font-semibold hover:bg-white/30"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
