import React from "react";
import { ChevronRight, CheckCircle, Clock, ListTodo, BarChart3 } from "lucide-react";
import { GradientBackground } from "@/Components/UI/GradientBackground";

type HeroSectionProps = {
  onGetStarted: () => void
}

export default function HeroSection({onGetStarted}: HeroSectionProps) {
  return (
    <section className="w-full min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <GradientBackground />
      </div>
    
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 mb-32">
        <div className="w-full lg:w-1/2 text-center lg:text-left pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium text-white shadow-lg mb-8">
            <CheckCircle className="w-4 h-4 text-black" />
            Open Source • Minimal • Powerful
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Focus on what
            <span className="block text-white opacity-70">
              matters most
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            A beautiful, distraction-free workspace designed for deep work. 
            Manage tasks, track time, and achieve your goals with elegance.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 bg-white text-zinc-900 rounded-xl px-8 py-4 text-base font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 blur-3xl opacity-60" />
            <div className="relative rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <img 
                src="/screens/todolist.png"
                alt="TaskRush Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <FeatureCard 
          icon={<ListTodo className="w-6 h-6" />}
          label="Smart Task Management"
          title="Organize effortlessly"
          description="Create lists, set priorities, and manage everything in one beautiful interface."
          screenshot="/screens/todolist.png"
        />
        <FeatureCard
          icon={<Clock className="w-6 h-6" />}
          label="Deep Focus Mode"
          title="Eliminate distractions"
          description="Choose a task, start the timer, and enter your flow state with our immersive focus mode."
          screenshot="/screens/focusmode.png"
          dark
        />
        <FeatureCard 
          icon={<CheckCircle className="w-6 h-6" />}
          label="Task Notes"
          title="Context at your fingertips"
          description="Keep important details right where you need them, attached to each task."
          screenshot="/screens/mininotes.png"
        />
        <FeatureCard 
          icon={<BarChart3 className="w-6 h-6" />}
          label="Progress Analytics"
          title="Track your productivity"
          description="Visualize your work patterns and celebrate your achievements with detailed insights."
          screenshot="/screens/analytics.png"
        />
      </div>
    </div>
    </section>
  )
}

type FeatureCardProps = {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  screenshot: string;
  dark?: boolean;
}

function FeatureCard({ icon, label, title, description, screenshot, dark }: FeatureCardProps) {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800/50 overflow-hidden hover:border-zinc-700/50 transition-all duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-white border border-white/10">
              {icon}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {label}
              </div>
              <h3 className="text-xl font-semibold text-white mt-0.5">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {description}
          </p>

          <div className="relative rounded-xl overflow-hidden border border-zinc-800/50">
            <img 
              src={screenshot}
              alt={title}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}