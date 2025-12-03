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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">

            {isPlaying && (
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        if (audioRef.current) audioRef.current.volume = v;
                    }}
                    className="w-24 h-1 appearance-none rounded-lg accent-white bg-white/20 backdrop-blur-md"
                />
            )}

            <button
                onClick={togglePlay}
                className="px-4 py-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition"
            >
                {isPlaying ? (
                    <Pause size={20} className="text-white" />
                ) : (
                    <Play size={20} className="text-white" />
                )}
            </button>
        </div>
        </>
    );
}