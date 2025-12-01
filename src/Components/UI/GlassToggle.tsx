import React from "react";
import { motion } from "framer-motion";

const options = ["Todo", "Focus"];

interface GlassButtonSwitchProps {
  current: string;
  onSwitch: (value: string) => void;
}

export default function GlassButtonSwitch({
  current,
  onSwitch,
}: GlassButtonSwitchProps) {
  return (
    <div className="relative flex bg-white/20 backdrop-blur-xl rounded-xl overflow-hidden p-1 border border-white/30 shadow-lg w-64">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSwitch(opt)}
          className={`relative z-10 flex-1 text-center font-semibold text-sm py-2 px-4 rounded-lg transition-all duration-300 ${
            current === opt ? "text-black" : "text-black/60 hover:text-black/80"
          }`}
        >
          {opt}
        </button>
      ))}

    <motion.div 
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] mx-1 rounded-lg bg-white backdrop-blur-md border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        animate={{
            x: current === "Focus" ? "100%" : "0%"
        }}
        transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
        }}
        />
        </div>
  );
}