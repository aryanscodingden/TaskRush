import React, { useEffect, useRef, useState } from "react";
import { useTimerStore } from "../../Stores/timer.store";
import { updateTask } from "../../Services/tasks.service";
import { BlurFade } from "../UI/BlurFade";
import { CheckCircle, X, Play, Pause } from "lucide-react";

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
    if (!taskId || !isRunning) return;
    const iv = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(iv);
  }, [taskId, isRunning, tick]);

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
      <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
        <BlurFade className="w-full max-w-md">
          <div
            ref={ref}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              cursor: "grab",
            }}
            className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.15)]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Session complete
                </div>
                <button
                  onClick={reset}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500"
                  >
                    <X className="w-4 h-4"/>
                  </button>
              </div>
              <div className="mb-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-1">
                  Task
                </div>
                <div className="font-semibold text-zinc-900 truncate">
                  {taskTitle}
                </div>
              </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-5">
              <div className="rounded-2xl bg-zinc-50 py-3">
                <div className="text-[11px] uppercase text-zinc-400 font-semibold">
                  Estimated
                </div>
                <div className="text-lg font-bold text-zinc-900">
                  {expectedMinutes}m
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 py-3">
                <div className="text-[11px] uppercase text-zinc-400 font-semibold">
                  Actual
                </div>
                <div className="text-lg font-bold text-emerald-600">
                  {takenMinutes}m
                </div>
              </div>
              <div className="rounded-2xl bg-zinc-50 py-3">
                <div className="text-[11px] uppercase text-zinc-400 font-semibold">
                  Early
                </div>
                <div className="text-lg font-bold text-emerald-600">
                  {early > 0 ? `${early}m` : "0m"}
                </div>
              </div>
            </div>

            <div className="mb-5 overflow-hidden rounded-2xl bg-zinc-100">
              <img
                src={MEME_URL}
                alt="celebration!"
                className="w-full h-44 object-cover mix-blend-multiply"
                />
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition active:scale-[0.97]"
                >
                  Start next task
                </button>
                <button 
                  onClick={reset}
                  className="flex-1 py-3 rounded-2xl bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition active:scale-[0.97]"
                  >
                    Take a break!
                  </button>
            </div>
          </div>
        </BlurFade>
      </div>
    );
  }

  const progress = 
    totalSeconds > 0
    ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100
    : 0;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <BlurFade className="pointer-events-auto">
        <div
          ref={ref}
          style={{
            transform: `translate(calc(50vw - 50%), calc(80vh - 50%)) translate(${offset.x}px, ${offset.y}px)`,
            cursor: "grab",
            touchAction: "none",
          }}
          className="max-auto w-full max-w-md bg-white/90 backdrop-blur-lg border border-zinc-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] px-5 pt-4 pb-4"
          >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 truncate max-w-[220px]">
                      {taskTitle}
                    </span>
                  </div>
                  <button
                    onClick={reset}
                    className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500"
                    >
                      <X className="w-4 h-4"/>
                    </button>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-black text-5xl tracking-tight text-zinc-900 tabular-nums">
                    {fmtTime(remainingSeconds)}
                  </div>
                  <div className="text-right text-[11px] text-zinc-500 font-medium">
                    <div>Est. {expectedMinutes} min</div>
                    <div className="text-[10px] text-zinc-400">
                      Spent {takenMinutes}m
                    </div>
                  </div>
                </div>

              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-400 ease-linear"
                  style={{width: `${progress}%`}}
                  />
              </div>

              <div className="flex items-center justify-between gap-3">
                {isRunning ? (
                  <button
                    onClick={pause}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition active:scale-[0.97]"
                    >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resume}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition active:scale-[0.97]"
                    >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                )}
                <button
                  onClick={finish}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-zinc-50 text-sm font-semibold hover:bg-zinc-800 transition active:scale-[0.97]"
                >
                  Done
                </button>
              </div>
            </div>
          </BlurFade>
        </div>
      );
    }

      