import React, {useEffect, useState, useRef} from 'react';
import { Save, X, Eye, Edit } from 'lucide-react';
import { updateTask } from '@/Services/tasks.service';
import { BlurFade } from '../UI/BlurFade';
import ReactMarkdown from "react-markdown";

type Props = {
    open: boolean
    task: any | null
    onClose: () => void
}

export default function TaskNotesDrawer({open, task, onClose}: Props) {
    const [notes, setNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [isPreview, setIsPreview] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    
    useEffect(() => {
        if (task) setNotes(task.notes || "")
    }, [task])

    useEffect(() => {
        if (!task) return 
        const id = setTimeout(() => {
            updateTask(task.id, {notes})
        }, 1000)

        return () => clearTimeout(id)
    }, [notes, task])

    const applyFormat = (formatType: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = notes;
        const selected = text.substring(start, end);

        let formatted = selected

        switch (formatType) {
            case "bold":
                formatted = `**${selected}**`;
                break;
            case "italic":
                formatted = `*${selected}*`
                break;
            case "underline":
                formatted = `__${selected}__`;
                break;
            case "bullet":
                if (selected.trim()) {
                    // If text is selected, convert each line to a bullet point
                    formatted = selected
                        .split("\n")
                        .map((line) => {
                            const trimmed = line.trim();
                            if (!trimmed) return "";
                            return trimmed.startsWith("- ") || trimmed.startsWith("• ") 
                                ? trimmed 
                                : `- ${trimmed}`;
                        })
                        .join("\n");
                } else {
                    // If no selection, insert a bullet point at cursor
                    formatted = "- ";
                }
                break; 
        }

        const updated = 
            text.substring(0, start) + formatted + text.substring(end);

        setNotes(updated);

        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start;
            textarea.selectionEnd = start + formatted.length;
        }, 0);
    };

    const handleShortcuts = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                applyFormat('bold');
            } else if (e.key === 'i') {
                e.preventDefault();
                applyFormat('italic');
            }
        }
    };

    const handleSave = async () => {
        if (!task) return
        setSaving(true)
        try {
            await updateTask(task.id, {notes})
            setIsPreview(true)
        } catch (err) {
            console.error("Failed to save notes:", err)
        } finally {
            setSaving(false)
        }
    }

    if (!open || !task) return null

    return (
        <div 
            className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end'
            onClick={onClose}
            >
            <div onClick={(e) => e.stopPropagation()} className='h-full'>
                <BlurFade
                 className='h-full w-[400px] bg-white/95 backdrop-blur-xl rounded-l-3xl shadow-xl p-6 flex flex-col'
                 >
        
                    <button
                    onClick={onClose}
                    className='absolute right-4 top-4 p-2 rounded-lg hover:bg-zinc-100 transition'
                    >
                        <X className='w-5 h-5 text-zinc-700' />
                    </button>
        
                    <h3 className='text-lg font-semibold mb-4 text-zinc-900 pr-12'>
                        {task.title}
                    </h3>

                    {!isPreview && (
                        <div className='flex items-center gap-2 border-b border-zinc-200 pb-2 mb-4'>
                            <button
                                className='text-sm px-2 py-1 hover:bg-zinc-100 rounded'
                                onClick={() => applyFormat("bold")}
                                >
                                    <b>B</b>
                                </button>
                            <button
                                className='text-sm px-2 py-1 hover:bg-zinc-100 rounded'
                                onClick={() => applyFormat("italic")}
                            >
                                <i>I</i>
                            </button>
                            <button
                                className='text-sm px-2 py-1 hover:bg-zinc-100 rounded'
                                onClick={() => applyFormat("bullet")}
                                >
                                    •
                                </button>
                        </div>
                    )}

                    {isPreview ? (
                        <div className='flex-1 w-full p-4 rounded-lg bg-zinc-50 border border-zinc-200 overflow-auto prose prose-zinc max-w-none'>
                            <ReactMarkdown>{notes || "No notes yet..."}</ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onKeyDown={handleShortcuts}
                            className='flex-1 w-full p-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:outline-none resize-none text-zinc-900'
                            placeholder='Add notes for this task...'
                            />
                    )}

                    <div className='flex gap-2 mt-4'>
                        {isPreview ? (
                            <button
                                onClick={() => setIsPreview(false)}
                                className='flex-1 bg-zinc-600 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition'
                            >
                                <Edit size={18} />
                                Edit
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition'
                            >
                                <Save size={18} />
                                {saving ? "Saving..." : "Save & Preview"}
                            </button>
                        )}
                    </div>
                </BlurFade>
            </div>
        </div>
    )
}
