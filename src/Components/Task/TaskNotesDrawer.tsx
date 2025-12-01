import {useEffect, useState} from 'react';
import { Save, X } from 'lucide-react';
import { updateTask } from '@/Services/tasks.service';
import { BlurFade } from '../UI/BlurFade';

type Props = {
    open: boolean
    task: any | null
    onClose: () => void
}

export default function TaskNotesDrawer({open, task, onClose}: Props) {
    const [notes, setNotes] = useState("")
    const [saving, setSaving] = useState(false)

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

    const handleSave = async () => {
        if (!task) return
        setSaving(true)
        try {
            await updateTask(task.id, {notes})
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

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes for this task..."
                        className='flex-1 w-full p-4 bg-zinc-50 rounded-xl border border-zinc-200 focus:border-zinc-400 focus:outline-none resize-none text-zinc-800 text-sm'
                    />

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className='mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition'
                        >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save"}
                        </button>
                </BlurFade>
            </div>
        </div>
    )
}
