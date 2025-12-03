import { useState, useRef } from "react";
import { Play, Pause } from 'lucide-react';

const LOFI_STREAM = "https://play.streamafrica.net/lofiradio";

export default function LofiPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [volume, setVolume] = useState(0.5);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.volume = volume;
            audioRef.current.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <>
        <audio ref={audioRef} src={LOFI_STREAM} loop />
        <div className="fixed bottom-6 right-6 z-50 glass-card border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3">
        <button 
            onClick={togglePlay}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center justify-center"
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

        <div className="text-xs font-medium text-white/80">
            <span className="block">Now Playing</span>
            <span className="text-white font-semibold tracking-wide">
                Lofi Beats 🎧
            </span>
        </div>

        {isPlaying && (
            <>
            <div className="flex gap-[3px] h-4 items-end">
                <div className="w-[3px] bg-green-400 animate-eq1 rounded-full" />
                <div className="w-[3px] bg-green-400 animate-eq2 rounded-full" />
                <div className="w-[3px] bg-green-400 animate-eq3 rounded-full" />
            </div>

            <style>{`
                .animate-eq1 {
                    animation: eq 0.8s infinite ease-in-out alternate;
                }
                .animate-eq2 {
                    animation: eq 0.6s infinite ease-in-out alternate;
                }
                .animate-eq3 {
                    animation: eq 0.9s infinite ease-in-out alternate;
                }
                @keyframes eq {
                    from { height: 30%; }
                    to { height: 100%; }
                }
            `}</style>
            </>
        )}
        </div>
        </>
    );
}