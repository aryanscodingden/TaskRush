import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ChevronLeft } from "lucide-react";
import { GradientBackground } from "@/Components/UI/GradientBackground";
import GlassButtonSwitch from "@/Components/UI/GlassToggle";
import TaskPickerModal from "@/Components/FocusTimer/TaskPickerModal";
import { useTimerStore } from "@/Stores/timer.store";
import { useTimer } from "@ark-ui/react";
import { toggleTaskComplete } from "@/Services/tasks.service";
import { useTasks } from "@/Stores/tasks.store";

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
        finish
    } = useTimerStore();
    
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
            // Mark task as complete
            toggleTaskComplete(taskId, true)
                .then(() => {
                    updateTask(taskId, { 
                        is_completed: true, 
                        completed_at: new Date().toISOString() 
                    });
                })
                .catch((err) => console.error("Failed to complete task:", err));
            
            // Play sound
            const audio = new Audio("/complete.mp3");
            audio.play().catch(() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Timer Complete!', {
                        body: `${taskTitle} session finished!`,
                        icon: '/logo192.png'
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

    const spentMinutes =  
        expectedMinutes * 60 > 0 
        ? Math.ceil((expectedMinutes * 60 - remainingSeconds) / 60)
        : 0;

    const progressPercentage = 
        expectedMinutes > 0 
        ? (remainingSeconds / (expectedMinutes * 60)) * 100
        : 0;

    return (
        <div className="h-screen w-full bg-zinc-950 text-white p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <GradientBackground />
            </div>
            
            <div className="relative z-10 w-full h-full flex flex-col items-center">
                {/* Centered Mode Switch */}

                <TaskPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
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
                    style={{width: `${progressPercentage}%`}}
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
    )
}

