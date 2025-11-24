import React, { useState, useEffect, useRef } from "react";
import { createTask } from "@/Services/tasks.service";
import { useLists } from "@/Stores/lists.store";
import { useTasks } from "@/Stores/tasks.store";
import { BlurFade } from "../UI/BlurFade";
import { X } from "lucide-react";
import { parse } from "path";

interface AddTaskModalProps {
    open: boolean;
    onClose: () => void;
}

function normalizeTimeInput(raw: string) {
    const cleaned = raw.replace(/[^\d:]/g, "");
    const parts = cleaned.split(":").slice(0,2);
    let mm = parts[0] || "0";
    let ss = parts[1] || "0";

    if (parts.length === 1 && mm.length > 2) {
        mm = mm.slice(0,3);
    }
    const mmN = parseInt(mm || "0", 10) || 0;
    let ssN = parseInt(ss || "0", 10) || 0;
    if (ssN >= 60) {
        ssN = ssN % 60;
    }
    return `${String(mmN)}:${String(ssN).padStart(2, "0")}`;
}

function parseMmSsToMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const mm = parseInt(parts[0] || "0", 10) || 0;
    const ss = parseInt(parts[1] || "0", 10) || 0;
    return mm + ss / 60;
}

export default function AddTaskModal({open, onClose}: AddTaskModalProps) {
    const {selectedListId} = useLists();
    const {addTask} = useTasks();
    const [title, setTitle] = useState("");
    const [timeStr, setTimeStr] = useState("0:00");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 70);

        } else {
            setTitle("");
            setTimeStr("0:00");
        }
    }, [open]);

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
        if (!title.trim() || !selectedListId) return; 
        const estMinute = parseMmSsToMinutes(timeStr);
        try {
            const created = await createTask({
               title: title.trim(),
               list_id: selectedListId,
               estimated_minutes: estMinute,
        });
        addTask(created);
        setTitle("");
        setTimeStr("0:00");
        onClose();
    } catch (err) {
        console.error("CreateTask failed", err);
    }
};

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-auto">
        <div className="absoulute inset-0 bg-white/60 backdrop-blur-sm"/>
        <BlurFade className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
        <button
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-700 hover: tex-black"
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
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title...."
                    className="mt-1 w-full px-3 py-2 border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-1 focus: ring-teal-300"
                    />
                    </div>

                <div className="w-24">
                    <label className="text-xs text-zinc-500">Est. Time</label>
                    <input 
                        value={timeStr}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="mt-1 w-full text-center px-3 py-2 border border-zinc-200 rounded-md bg-white text-black focus: outline-none focus: ring-1 focus:ring-teal-300"
                        placeholder="0:00"
                        />
                    </div>
                    </div>
                 

                <div className="text-xs text-zinc-500 mb-4">Add a new task</div>

                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        className="ml-auto px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to lime-400 text-black font-semibold"
                        >
                            Confirm
                        </button>






                </div>






                

        </BlurFade>








    </div>
)

}