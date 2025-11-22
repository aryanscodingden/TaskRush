import React, { useEffect, useState } from "react";
import { useLists } from "../Stores/lists.store";
import { useTasks } from "../Stores/tasks.store";
import {
  getLists,
  getTasks,
  createList,
  createTask,
  toggleTaskComplete,
} from "../Services/tasks.service";
import { cn } from "../Lib/utils";
import { supabase } from "../Services/supabase";
import { GradientBackground } from "../Components/UI/GradientBackground";
import { BlurFade } from "../Components/UI/BlurFade";
import { GlassButton } from "../Components/UI/GlassButton";
import { Plus, Check, List as ListIcon } from "lucide-react";

export default function Today() {
  const { lists, setLists, addList, selectedListId, selectList } = useLists();
  const { tasks, setTasks, addTask, updateTask } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showNewList, setShowNewList] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const listsData = await getLists();
      setLists(listsData);

      if (listsData.length > 0 && !selectedListId) {
        const first = listsData[0].id;
        selectList(first);
        loadTasks(first);
      }
    } catch (err) {
      console.error("Failed to load lists", err);
    }
  };

  const loadTasks = async (listId: string) => {
    try {
      const tasksData = await getTasks(listId);
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  const handleSelectList = (listId: string) => {
    selectList(listId);
    loadTasks(listId);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const list = await createList(newListName.trim());
      addList(list); // Zustand store
      setNewListName("");
      setShowNewList(false);

      handleSelectList(list.id);
    } catch (err) {
      console.error("Failed to create list:", err);
    }
  };

  // -----------------------------
  // CREATE NEW TASK
  // -----------------------------
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedListId) return;

    try {
      const created = await createTask({
        title: newTaskTitle.trim(),
        list_id: selectedListId,
        estimated_minutes: 25,
      });
      addTask(created);
      setNewTaskTitle("");
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await toggleTaskComplete(taskId, isCompleted);
      updateTask(taskId, { is_completed: isCompleted });
    } catch (err) {
      console.error("Failed to toggle", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredTasks = selectedListId
    ? tasks.filter((t) => t.list_id === selectedListId)
    : tasks;

  return (
    <div className="bg-background h-full w-full flex flex-col relative overflow-hidden text-foreground">
      <style>{`
            input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; } input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; } input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: var(--foreground) !important; background-color: transparent !important; background-clip: content-box !important; transition: background-color 5000s ease-in-out 0s !important; color: var(--foreground) !important; caret-color: var(--foreground) !important; } input:autofill { background-color: transparent !important; background-clip: content-box !important; -webkit-text-fill-color: var(--foreground) !important; color: var(--foreground) !important; } input:-internal-autofill-selected { background-color: transparent !important; background-image: none !important; color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; } input:-webkit-autofill::first-line { color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground) !important; }
            @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; } @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
            .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); } .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); } .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); pointer-events: none; z-index: 0; } .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, oklch(from var(--foreground) l c h / 20%), oklch(from var(--foreground) l c h / 10%)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
            .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, oklch(from var(--background) l c h / 5%), oklch(from var(--background) l c h / 20%), oklch(from var(--background) l c h / 5%)); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.25em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.15em 0.05em -0.1em oklch(from var(--foreground) l c h / 25%), 0 0 0.05em 0.1em inset oklch(from var(--background) l c h / 50%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-button-text { color: oklch(from var(--foreground) l c h / 90%); text-shadow: 0em 0.25em 0.05em oklch(from var(--foreground) l c h / 10%); transition: all var(--anim-time) var(--anim-ease); } .glass-button:hover .glass-button-text { text-shadow: 0.025em 0.025em 0.025em oklch(from var(--foreground) l c h / 12%); } .glass-button-text::after { content: ""; display: block; position: absolute; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, oklch(from var(--background) l c h / 50%) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(var(--anim-time) * 1.25) var(--anim-ease), --angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease); } .glass-button:hover .glass-button-text::after { background-position: 25% 50%; } .glass-button:active .glass-button-text::after { background-position: 50% 15%; --angle-2: -15deg; } .glass-button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, oklch(from var(--foreground) l c h / 50%) 0%, transparent 5% 40%, oklch(from var(--foreground) l c h / 50%) 50%, transparent 60% 95%, oklch(from var(--foreground) l c h / 50%) 100%), linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) oklch(from var(--background) l c h / 50%); pointer-events: none; } .glass-button:hover::after { --angle-1: -125deg; } .glass-button:active::after { --angle-1: -75deg; } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow { filter: blur(clamp(2px, 0.0625em, 6px)); } .glass-button-wrap:has(.glass-button:hover) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.875em); opacity: 1; } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow { filter: blur(clamp(2px, 0.125em, 12px)); } .glass-button-wrap:has(.glass-button:active) .glass-button-shadow::after { top: calc(var(--shadow-cutoff-fix) - 0.5em); opacity: 0.75; } .glass-button-wrap:has(.glass-button:active) .glass-button-text { text-shadow: 0.025em 0.25em 0.05em oklch(from var(--foreground) l c h / 12%); } .glass-button-wrap:has(.glass-button:active) .glass-button { box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.125em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0.225em 0.05em 0 oklch(from var(--foreground) l c h / 5%), 0 0.25em 0 0 oklch(from var(--background) l c h / 75%), inset 0 0.25em 0.05em 0 oklch(from var(--foreground) l c h / 15%); } @media (hover: none) and (pointer: coarse) { .glass-button::after, .glass-button:hover::after, .glass-button:active::after { --angle-1: -75deg; } .glass-button .glass-button-text::after, .glass-button:active .glass-button-text::after { --angle-2: -45deg; } }
            .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; } .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, oklch(from var(--background) l c h / 5%), oklch(from var(--background) l c h / 20%), oklch(from var(--background) l c h / 5%)); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.25em 0.125em -0.125em oklch(from var(--foreground) l c h / 20%), 0 0 0.1em 0.25em inset oklch(from var(--background) l c h / 20%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-input-wrap:focus-within .glass-input { backdrop-filter: blur(0.01em); box-shadow: inset 0 0.125em 0.125em oklch(from var(--foreground) l c h / 5%), inset 0 -0.125em 0.125em oklch(from var(--background) l c h / 50%), 0 0.15em 0.05em -0.1em oklch(from var(--foreground) l c h / 25%), 0 0 0.05em 0.1em inset oklch(from var(--background) l c h / 50%), 0 0 0 0 oklch(from var(--background) l c h); } .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + clamp(1px, 0.0625em, 4px)); height: calc(100% + clamp(1px, 0.0625em, 4px)); top: calc(0% - clamp(1px, 0.0625em, 4px) / 2); left: calc(0% - clamp(1px, 0.0625em, 4px) / 2); padding: clamp(1px, 0.0625em, 4px); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, oklch(from var(--foreground) l c h / 50%) 0%, transparent 5% 40%, oklch(from var(--foreground) l c h / 50%) 50%, transparent 60% 95%, oklch(from var(--foreground) l c h / 50%) 100%), linear-gradient(180deg, oklch(from var(--background) l c h / 50%), oklch(from var(--background) l c h / 50%)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(clamp(1px, 0.0625em, 4px) / 2) oklch(from var(--background) l c h / 50%); pointer-events: none; } .glass-input-wrap:focus-within .glass-input::after { --angle-1: -125deg; } .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; } .glass-input-text-area::after { content: ""; display: block; position: absolute; width: calc(100% - clamp(1px, 0.0625em, 4px)); height: calc(100% - clamp(1px, 0.0625em, 4px)); top: calc(0% + clamp(1px, 0.0625em, 4px) / 2); left: calc(0% + clamp(1px, 0.0625em, 4px) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, oklch(from var(--background) l c h / 50%) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: screen; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1), --angle-2 calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1); } .glass-input-wrap:focus-within .glass-input-text-area::after { background-position: 25% 50%; }
            .glass-card { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
      `}</style>

      <div className="absolute inset-0 z-0"><GradientBackground /></div>

      <div className="absolute top-4 right-4 z-20">
        <GlassButton onClick={handleSignOut} size="sm">
          Sign Out
        </GlassButton>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <BlurFade delay={0.1}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Good Afternoon</h1>
              <p className="text-muted-foreground text-lg">
                Ready to Rush through your afternoon?
              </p>
            </div>
          </BlurFade>

          {/* LISTS SECTION */}
          <div className="mb-12">
            <BlurFade delay={0.2}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Your Lists</h2>
                <GlassButton size="sm" onClick={() => setShowNewList(!showNewList)}>
                  {showNewList ? "Cancel" : "New List"}
                </GlassButton>
              </div>
            </BlurFade>

            {showNewList && (
              <BlurFade delay={0.1}>
                <form onSubmit={handleCreateList} className="mb-6 max-w-md">
                  <div className="glass-input-wrap w-full">
                    <div className="glass-input">
                      <span className="glass-input-text-area"></span>
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                        <ListIcon className="h-5 w-5 text-foreground/80" />
                      </div>
                      <input
                        type="text"
                        placeholder="List name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                      />
                      <div className="relative z-10 flex-shrink-0 pr-1">
                        <GlassButton type="submit" size="icon" contentClassName="text-foreground/80 hover:text-foreground">
                          <Plus className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </form>
              </BlurFade>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list, i) => (
                <BlurFade key={list.id} delay={0.1 * (i + 1)}>
                  <div
                    className={cn(
                      "glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-white/10",
                      selectedListId === list.id ? "ring-2 ring-primary bg-white/10" : ""
                    )}
                    onClick={() => handleSelectList(list.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{list.name}</h3>
                      <div className="bg-white/10 p-2 rounded-full">
                        <ListIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tasks.filter((t) => t.list_id === list.id).length} tasks
                    </p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <BlurFade delay={0.4}>
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">
                {selectedListId
                  ? lists.find((l) => l.id === selectedListId)?.name || "Tasks"
                  : "Tasks"}
              </h2>
            </BlurFade>

            {/* QUICK ADD TASK */}
            {selectedListId && (
              <BlurFade delay={0.5}>
                <form onSubmit={handleCreateTask} className="mb-8 max-w-2xl">
                  <div className="glass-input-wrap w-full">
                    <div className="glass-input">
                      <span className="glass-input-text-area"></span>
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                        <Plus className="h-5 w-5 text-foreground/80" />
                      </div>
                      <input
                        placeholder="Add a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="relative z-10 h-full w-0 flex-grow bg-transparent text-foreground placeholder:text-foreground/60 focus:outline-none"
                      />
                      <div className="relative z-10 flex-shrink-0 pr-1">
                        <GlassButton type="submit" size="sm">
                          Add Task
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </form>
              </BlurFade>
            )}

            <div className="space-y-3">
              {filteredTasks.map((task, i) => (
                <BlurFade key={task.id} delay={0.05 * i}>
                  <div className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                    <div 
                        className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                            task.is_completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"
                        )}
                        onClick={() => handleToggleTask(task.id, !task.is_completed)}
                    >
                        {task.is_completed && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    
                    <span
                      className={cn(
                        "flex-1 text-lg transition-all",
                        task.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {task.title}
                    </span>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        {/* Placeholder for actions */}
                    </div>
                  </div>
                </BlurFade>
              ))}
              
              {filteredTasks.length === 0 && selectedListId && (
                  <div className="text-center py-12 text-muted-foreground">
                      <p>No tasks yet. Add one above!</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
