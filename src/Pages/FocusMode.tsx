import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ChevronLeft } from "lucide-react";
import { GradientBackground } from "@/Components/UI/GradientBackground";

type FocusModeProps = {
    onBackToTasks: () => void;
    onPickTask: () => void; 
};

export default function FocusMode({ onBackToTasks, onPickTask}: FocusModeProps) {
    const [seconds, setSeconds] = useState(25*60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning) return; 
        const interval = setInterval(() => {
            setSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000)
        return () => clearInterval(interval);
    }, [isRunning]);
    
    const reset = () => {
        setSeconds(25*60);
        setIsRunning(false);
    };

    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="h-screen w-full bg-zinc-950 text-white p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <GradientBackground />
            </div>
            
            <div className="relative z-10 w-full h-full flex flex-col items-center">
                <button
                    onClick={onBackToTasks}
                    className="absolute top-6 left-6 flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>
            
                <button 
                    onClick={onPickTask}
                    className="absolute top-6 right-6 px-4 py-2 text-black font-semibold bg-white rounded-xl hover:opacity-90 transition"
                >
                    Choose Task
                </button>
            
                <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="text-7xl font-black tabular-nums text-white drop-shadow-xl">
                        {formatTime(seconds)}
                    </div>
                
                    <div className="flex items-center gap-4">
                        {!isRunning ? (
                            <button
                                onClick={() => setIsRunning(true)}
                                className="px-6 py-3 bg-green-500 rounded-xl flex items-center gap-2 font-semibold text-black"
                            >
                                <Play size={16} />
                                Start
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsRunning(false)}
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

