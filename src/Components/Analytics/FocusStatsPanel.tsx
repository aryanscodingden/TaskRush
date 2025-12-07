import React, { useEffect, useState } from "react";
import { BlurFade } from "../UI/BlurFade";
import { X } from "lucide-react";
import { supabase } from "@/Services/supabase";
import type { Task } from "@/Services/tasks.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

type DayStat = {
  dateKey: string;
  label: string;
  totalEstimated: number;
  totalActual: number;
  focusPercent: number;
  tasksCompleted: number;
};

export default function FocusStatsPanel({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [summary, setSummary] = useState({
    totalActual: 0,
    avgFocus: 0,
    tasksCompleted: 0,
  });

  useEffect(() => {
    if (!open) return;
    loadStats();
  }, [open]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const from = new Date();
      from.setDate(from.getDate() - 13);
      const fromISO = from.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("created_at", fromISO);

      if (error) throw error;

      const tasks = (data || []) as Task[];

      const byDate: Record<string, DayStat> = {};

      for (const t of tasks) {
        const key = (t.completed_at || t.created_at).slice(0, 10);
        if (!byDate[key]) {
          const d = new Date(key);
          const label = d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          byDate[key] = {
            dateKey: key,
            label,
            totalEstimated: 0,
            totalActual: 0,
            focusPercent: 0,
            tasksCompleted: 0,
          };
        }
        const row = byDate[key];

        if (t.is_completed) {
          row.tasksCompleted += 1;
          row.totalEstimated += t.estimated_minutes || 0;
          row.totalActual += t.actual_minutes || 0;
        }
      }
      const rows = Object.values(byDate)
        .sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1))
        .map((r) => ({
          ...r,
          focusPercent:
            r.totalEstimated > 0
              ? Math.min(150, (r.totalActual / r.totalEstimated) * 100)
              : 0,
        }));

      const totalActual = rows.reduce((s, r) => s + r.totalActual, 0);
      const tasksCompleted = rows.reduce((s, r) => s + r.tasksCompleted, 0);
      const avgFocus =
        rows.length > 0
          ? rows.reduce((s, r) => s + r.focusPercent, 0) / rows.length
          : 0;

      setStats(rows);
      setSummary({
        totalActual,
        avgFocus,
        tasksCompleted,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <BlurFade className="w-full max-w-3xl">
        <div className="relative rounded-3xl bg-zinc-950/90 border border-zinc-800 p-6 md:p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
                Focus Insights
            </h2>
            <p className="text-sm text-zinc-400">
                Last 14 days, based on completed tasks & focus sessions
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-400">Loading stats...</div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card rounded-2xl p-4 border border-zinc-800">
                <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                    Focus Minutes
                </div>
                <div className="text-2xl font-bold text-white">
                    {Math.round(summary.totalActual)}m
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                    Time you actually sat and focused
                </div>
                </div>

            <div className="glass-card rounded-2xl p-4 border border-zinc-800">
                <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                    Average Focus %
                </div>
                <div className="text-2xl font-bold text-white">
                    {Math.round(summary.avgFocus)}%
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="h-full bg-emerald-400"
                        style={{width: `${Math.min(100, summary.avgFocus)}%`}}
                        />
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                    Actual Time vs Estimated Time
                </div>
            </div>
            
            <div className="glass-card rounded-2xl p-4 border border-zinc-800">
                <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                    Tasks Completed
                </div>
                <div className="text-2xl font-bold text-white">
                    {summary.tasksCompleted}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                    Completed with or without timer
                </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-zinc-200">
                    Productivity over time
                </div>
                <div className="text-[11px] text-zinc-500">
                    Bars: Actual vs Estimated Minutes · Line: focus %
                </div>
            </div>

            <div className="h-52 flex items-end gap-2 md:gap-3">
                {stats.map((d) => {
                    const maxMinutes = Math.max(
                        ...stats.map((s: DayStat) => Math.max(s.totalEstimated, s.totalActual)),
                        30
                    );
                    const estHeight = (d.totalEstimated / maxMinutes) * 100;
                    const actHeight = (d.totalActual / maxMinutes) * 100;
                    const focusHeight = d.focusPercent; 

                    return (
                        <div
                            key = {d.dateKey}
                            className="flex-1 flex flex-col items-center gap-1"
                            >
                                <div className="relative w-full flex-1 flex items-end justify-center">
                                    <div 
                                        className="w-2 rounded-full bg-zinc-700/60 mr-0.5"
                                        style={{height: `${estHeight}%`}}
                                        />
                                        <div 
                                            className="w-2 rounded-full bg-emerald-400/90"
                                            style={{height: `${actHeight}%`}}
                                        />
                                        <div 
                                            className="absolute left-1/2 -translate-x-1/2 w-7 h-[2px] rounded-full bg-sky-400/80"
                                            style={{
                                                bottom: `${Math.min(focusHeight, 140)}%`
                                            }}
                                            />
                                            </div>
                                            <div className="text-[11px] text-zinc-400">{d.label}</div>
                                            </div>
                                            
                    )
                })}
            </div>
          </div>
            </>
          )}
        </div>
      </BlurFade>
    </div>
  );
}
