// src/Components/FocusTimer/FocusTimer.tsx
import React, { useEffect, useRef, useState } from "react";
import { useTimerStore } from "../../Stores/timer.store";
import { updateTask } from "../../Services/tasks.service";
import { BlurFade } from "../UI/BlurFade";

const MEME_URL = "https://c.tenor.com/GextgpxYonoAAAAd/tenor.gif"; 

function fmtTime(secTotal: number) {
  const m = Math.floor(secTotal / 60).toString().padStart(2, "0");
  const s = Math.floor(secTotal % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function FocusTimer() {
  const {
    taskId,
    taskTitle,
    expectedMinutes,
    remainingSeconds,
    totalSeconds,
    isRunning,
    finished,
    tick,
    pause,
    resume,
    finish,
    reset,
  } = useTimerStore();

  const ref = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const pos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!taskId) return;
    const iv = setInterval(() => tick(), 1000);
    return () => clearInterval(iv);
  }, [taskId, tick]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      dragStart.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffset({ x: pos.current.x + dx, y: pos.current.y + dy });
    };
    const onPointerUp = () => {
      pos.current = { x: offset.x, y: offset.y };
      dragStart.current = null;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [offset.x, offset.y]);

  const takenMinutes = Math.ceil((totalSeconds - remainingSeconds) / 60);

  useEffect(() => {
    if (finished && taskId) {
      (async () => {
        try {
          await updateTask(taskId, {
            actual_minutes: takenMinutes,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error("persist timer result failed", err);
        }
      })();
    }
  }, [finished, taskId, takenMinutes]);

  if (!taskId) return null;

  if (finished) {
    const early = Math.max(0, expectedMinutes - takenMinutes);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <BlurFade className="w-full max-w-sm">
          <div
            ref={ref}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              cursor: "grab",
            }}
            className="bg-white rounded-3xl border-2 border-zinc-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
                {taskTitle}
              </div>
              <h3 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Mission Complete</h3>

              <div className="mb-6 overflow-hidden rounded-2xl bg-zinc-100">
                <img src={MEME_URL} alt="Celebration" className="w-full h-48 object-cover mix-blend-multiply" />
              </div>

              <div className="text-zinc-500 font-medium mb-6">
                You saved <span className="text-green-600 font-bold">{early}m</span> today.
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => reset()} className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700">
                  Start Next Task
                </button>

                <button onClick={() => reset()} className="w-full py-4 rounded-2xl bg-zinc-50 text-zinc-500 font-bold hover:bg-zinc-100">
                  Take a Break
                </button>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-6 pointer-events-none">
      <BlurFade className="pointer-events-auto">
        <div
          ref={ref}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            cursor: "grab",
            touchAction: "none",
          }}
          className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-sm border border-zinc-100"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-[0.2em] mb-2">Current Task</div>
            <div className="text-zinc-500 font-medium text-center line-clamp-1 px-4">{taskTitle}</div>
          </div>

          <div className="flex justify-center mb-8 relative">
            <div className="font-black text-7xl tracking-tighter text-zinc-900 tabular-nums">{fmtTime(remainingSeconds)}</div>
          </div>

          <div className="w-full h-1.5 bg-zinc-100 rounded-full mb-10 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000 ease-linear" style={{ width: `${((totalSeconds - remainingSeconds) / totalSeconds) * 100}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isRunning ? (
              <>
                <button onClick={() => pause()} className="py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100">Pause</button>
                <button onClick={() => finish()} className="py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg">Finish</button>
              </>
            ) : (
              <>
                <button onClick={() => resume()} className="py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg">Resume</button>
                <button onClick={() => reset()} className="py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100">Stop</button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{takenMinutes}m / {expectedMinutes}m</span>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
