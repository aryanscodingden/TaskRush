import React from "react";
import { ChevronRight } from "lucide-react";
import { GradientBackground } from "../../Components/UI/GradientBackground";

interface HeroProps {
    onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroProps) {
  return (
    <section className="w-full min-h-screen py-32 relative overflow-hidden pt-40">
      <div className="absolute inset-0 z-0">
        <GradientBackground />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 h-full flex flex-col items-center">
        <div className="w-full max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-slate-200 text-sm font-semibold shadow-md text-black">
            Open Source
          </span>
          <h1 className="font-sans text-6xl md:text-7xl font-bold tracking-tighter text-black mt-8 drop-shadow-2xl leading-tight opacity-60">
            No distracting elements,
            <br />
            just good UI
          </h1>
          <h2 className="font-sans text-2xl md:text-3xl font-medium tracking-tight text-black mt-6">
            Focus at its peak.
          </h2>
          <p className="font-sans text-lg md:text-xl max-w-2xl mt-6 text-center font-normal text-black mx-auto leading-relaxed">
            TaskRush transforms tasks into a visually calming experience.
            <br className="hidden md:block" />
            Built for focus, speed & flow.
          </p>

          <div className="flex items-center justify-center mt-10 gap-3">
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 bg-white rounded-full text-black font-semibold px-8 py-4 hover:bg-slate-100 transition-all duration-200 border border-slate-200 shadow"
            >
              Get Started
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
