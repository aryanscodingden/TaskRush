import React, { useState, useEffect, useRef } from "react";
import { useLists } from "@/Stores/lists.store";
import { createList } from "@/Services/tasks.service";
import { BlurFade } from "../UI/BlurFade";
import { X } from "lucide-react";

interface AddListModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddListModal({ open, onClose }: AddListModalProps) {
  const { addList, selectList } = useLists();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setName("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      const newList = await createList(name.trim());
      addList(newList);
      selectList(newList.id);
      onClose();
    } catch (err) {
      console.error("Failed to create list", err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      <BlurFade className="relative z-10 w-full max-w-sm bg-white rounded-2x1 p-6 shadow-x1 border border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">New List</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <label className="text-xs text-zinc-500">List Name</label>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          className="mt-1 w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white focus:outline-none focus: ring-2 focus: ring-teal-400"
        />

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-x1 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
          >
            Confirm
          </button>
        </div>
      </BlurFade>
    </div>
  );
}
