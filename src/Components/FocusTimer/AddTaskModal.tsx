import React, { useState, useEffect, useRef } from "react";
import { createTask } from "@/Services/tasks.service";
import { useLists } from "@/Stores/lists.store";
import { useTasks } from "@/Stores/tasks.store";
import { BlurFade } from "../UI/BlurFade";
import { X } from "lucide-react";

interface AddTaskModalProps {
    open: boolean;
    onClose: () => void;
}

function parseMmSsToMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const mm = parseInt(parts[0] || "0", 10) || 0;
    const ss = parseInt(parts[1] || "0", 10) || 0;
    return mm + ss / 60;
}

export default function AddTaskModal({open, onClose}: AddTaskModalProps) {
    const {selectedListId, lists} = useLists();
    const {addTask} = useTasks();
    const [title, setTitle] = useState("");
    const [timeStr, setTimeStr] = useState("0:00");
    const [priority, setPriority] = useState(2);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);


    useEffect(() => {
        if (open) {
            // Check if there are no lists when modal opens
            if (lists.length === 0) {
                setError("Please create a list first before adding tasks");
            } else {
                setError("");
            }
            setTimeout(() => inputRef.current?.focus(), 70);
        } else {
            setTitle("");
            setTimeStr("0:00");
            setError("");
            setLoading(false);
        }
    }, [open, lists.length]);

    if (!open) return null;

    const handleTimeChange = (val: string) => {
        const only = val.replace(/[^\d:]/g, "");
        const parts = only.split(":").slice(0,2);
        if (parts.length === 1) {
            setTimeStr(`${parts[0] || "0"}:00`);
        } else {
            const mm = parts[0] || "0";
            let ss = parts[1] || "0";
            if (ss.length === 1) ss = `0${ss}`;
            setTimeStr(`${mm}:${ss.slice(0, 2)}`);
        }
    };

    const handleConfirm = async () => {
        console.log("Title:", title);
        console.log("List ID:", selectedListId);
        console.log("Time String:", timeStr);
        console.log("Priority:", priority);
        
        setError("");
        
        // Check if user has any lists first
        if (lists.length === 0) {
            console.log("Validation failed: No lists exist");
            setError("Please create a list first before adding tasks");
            return;
        }
        
        if (!title.trim()) {
            console.log("Validation failed: Empty title");
            setError("Please enter a task title");
            return;
        }
        
        if (!selectedListId) {
            console.log("Validation failed: No list selected");
            setError("Please select a list first");
            return;
        }
        
        setLoading(true);
        console.log("Starting task creation...");
        
        const estMinute = parseMmSsToMinutes(timeStr);
        console.log("Parsed estimated minutes:", estMinute);
        
        const taskData = {
            title: title.trim(),
            list_id: selectedListId,
            estimated_minutes: estMinute,
            priority: priority,
        };
        console.log("📦 Task data to send:", taskData);
        
        try {
            console.log("Calling createTask...");
            const created = await createTask(taskData);
            console.log("Task created successfully:", created);
            addTask(created);
            setTitle("");
            setTimeStr("0:00")
            onClose();
    
        } catch (err) {
            console.error("Error object:", err);
            console.error("Error message:", err instanceof Error ? err.message : String(err));
            setError(`Failed to add task: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-auto">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"/>
        <BlurFade className="relative z-10 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-zinc-700 hover:text-black"
                >
                    <X size={18} />
                    <span className="uppercase text-xs font-semibold">Cancel</span>
                </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                    <label className="text-xs text-zinc-500">Title</label>
                    <input 
                        ref={inputRef}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setError(""); 
                        }}
                        placeholder="Task title...."
                        className="mt-1 w-full px-3 py-2 border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-teal-300"
                    />
                </div>
            <div className="w-20">
                <label className="text-xs text-zinc-500">Priority</label>
                <select 
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-black focus:outline-none focus:ring-1 focus:ring-teal-300"
                >
                    <option value={1}>P1</option>
                    <option value={2}>P2</option>
                    <option value={3}>P3</option>
                </select>
            </div>

                <div className="w-24">
                    <label className="text-xs text-zinc-500">Est. Time</label>
                    <input 
                        value={timeStr}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="mt-1 w-full text-center px-3 py-2 border border-zinc-200 rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-teal-300"
                        placeholder="0:00"
                    />
                </div>
            </div>
                 

            <div className="text-xs text-zinc-500 mb-4">Add a new task</div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={(e) => {
                        console.log("🖱️ Button physically clicked!", e);
                        handleConfirm();
                    }}
                    disabled={loading}
                    className="ml-auto px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-lime-400 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                    {loading ? "Adding..." : "Confirm"}
                </button>
            </div>
        </BlurFade>
    </div>
);

}