import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ChevronLeft } from "lucide-react";

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
        <div className="h-screen w-full bg-zinc-950 text-white p-6 flex flex-col items-center">
            <button
                onClick={onBackToTasks}
                className="absolute top-6 left-6 flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>
        <button 
            onClick={onPickTask}
            className="absoulute top-6 right-6 px-4 py-2 text-black font-semibold bg-white rounded-x1 hover:opacity-90 transition"
            >
                Choose Task
            </button>
        
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-7xl font-black tabular-nums text-white drop-shadow-x1">
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
                            className="px-6 py-3 bg-red-500 rounded-x1 flex items-center gap-2 font-semibold text-black"
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
    )
}

