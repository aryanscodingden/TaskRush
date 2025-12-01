import React, { useEffect, useState } from "react";
import { useLists } from "../Stores/lists.store";
import { useTasks } from "../Stores/tasks.store";
import {
  getLists,
  getTasks,
  createList,
  toggleTaskComplete,
} from "../Services/tasks.service";
import { cn } from "../Lib/utils";
import { GradientBackground } from "../Components/UI/GradientBackground";
import { BlurFade } from "../Components/UI/BlurFade";
import { GlassButton } from "../Components/UI/GlassButton";
import AddTaskModal from "../Components/FocusTimer/AddTaskModal";
import FocusTimer from "../Components/FocusTimer/FocusTimer";
import AddListModal from "../Components/Lists/AddListModal";
import TaskNotesDrawer from "@/Components/Task/TaskNotesDrawer";
import { deleteList } from "../Services/tasks.service";
import { Check, List, Plus, Trash2 } from "lucide-react";
import { useTimerStore } from "../Stores/timer.store";
import { Card, CardContent } from "../Components/UI/card";
import { supabase } from "@/Services/supabase";
import GlassButtonSwitch from "@/Components/UI/GlassToggle";


interface TodayProps {
  onSwitchMode: (mode: "todo" | "focus") => void;
}

export default function Today({ onSwitchMode }: TodayProps) {
  const { lists, setLists, addList, selectedListId, selectList } = useLists();
  const { tasks, setTasks, updateTask } = useTasks();
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addListModalOpen, setAddListModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);

  const handleSwitch = (mode: string) => {
    if (mode === "Focus") {
      onSwitchMode("focus");
    } else if (mode === "Todo") {
      onSwitchMode("todo");
    }
  };

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
        await loadTasks(first);
      }
    } catch (err) {
      console.error("Failed to load lists", err);
    }
  };

  const loadTasks = async (listId?: string) => {
    try {
      const tasksData = await getTasks(listId);
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  const handleSelectList = async (listId: string) => {
    selectList(listId);
    await loadTasks(listId);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };


  const handleDeleteList = async (id: string) => {
    setListToDelete(id);

    try {
      await deleteList(id);
      setLists(lists.filter((l) => l.id !== id));
      if (selectedListId === id) selectList(null);
    } catch (err) {
      console.error("Failed deleting list", err);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = prompt("Create list name:");
    if (!name) return;
    try {
      const list = await createList(name.trim());
      addList(list);
      handleSelectList(list.id);
    } catch (err) {
      console.error(err);
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

  const parseMmSsToMinutes = (str: string) => {
    const [mm, ss] = str.split(":").map(Number);
    return mm + (ss || 0) / 60;
  };

  const handleSaveEst = async (taskId: string) => {
    const mins = parseMmSsToMinutes(editTime);
    try {
      await updateTask(taskId, { estimated_minutes: mins });
    } catch (err) {
      console.error("Failed updating est", err);
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTime("");
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete) return;
    await deleteList(listToDelete);
    setLists(lists.filter((l) => l.id !== listToDelete));
    if (selectedListId === listToDelete) selectList(null);
    setListToDelete(null);
  };

  const startTimerForTask = (task: any) => {
    const expected = task.estimated_minutes ?? 1;
    useTimerStore.getState().start(task.id, task.title, expected);
  };

  const filteredTasks = (
    selectedListId ? tasks.filter((t) => t.list_id === selectedListId) : tasks
  ).sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3));

  return (
    <div className="bg-background h-full w-full flex flex-col relative overflow-hidden text-foreground">
      <div className="absolute inset-0 z-0">
        <GradientBackground />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        <div className="absolute top-6 right-6 z-20">
          <GlassButton size="sm" onClick={handleSignOut}>
            Sign Out
          </GlassButton>
        </div>
        
        {/* Centered Mode Switch */}
        <div className="flex justify-center mb-4 mt-2">
          <GlassButtonSwitch
            current="Todo"
            onSwitch={handleSwitch}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            <aside className="col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold tracking-tight">Lists</h3>
                <GlassButton
                  size="sm"
                  onClick={() => setAddListModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </GlassButton>
              </div>

              <div className="space-y-3">
                {lists.map((list) => (
                  <BlurFade key={list.id} className="block">
                    <div
                      className={cn(
                        "glass-card rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 group relative",
                        selectedListId === list.id
                          ? "ring-2 ring-primary bg-white/10"
                          : "hover:bg-white/5"
                      )}
                    >
                      <div
                        className="flex-1"
                        onClick={() => handleSelectList(list.id)}
                      >
                        <div className="font-semibold text-[15px] truncate">
                          {list.name}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          {tasks.filter((t) => t.list_id === list.id).length}{" "}
                          tasks
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </aside>

            <main className="col-span-9">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {selectedListId
                      ? lists.find((l) => l.id === selectedListId)?.name
                      : "All Tasks"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Focus and get things done
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <GlassButton onClick={() => setAddTaskModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </GlassButton>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTasks.length === 0 && (
                  <div className="p-8 rounded-xl glass-card text-center text-muted-foreground">
                    No tasks yet, add one using add task
                  </div>
                )}

                {filteredTasks.map((task, idx) => (
                  <BlurFade key={task.id} className="block">
                    <Card className="border-zinc-800 glass-card rounded-xl p-4 hover:bg-white/10 transition-colors">
                      <CardContent className="flex items-center gap-4 p-0 w-full">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            onClick={() =>
                              handleToggleTask(task.id, !task.is_completed)
                            }
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                              task.is_completed
                                ? "bg-primary border-primary"
                                : "border-muted-foreground hover:border-primary"
                            )}
                          >
                            {task.is_completed && (
                              <Check className="w-3.5 h-3.5 text-primary-foreground" />
                            )}
                          </div>
                          <select
                            className="bg-transperent text-xs text-zinc-400 outline-none"
                            value={task.priority ?? 3}
                            onChange={async (e) => {
                              const newPriority = parseInt(e.target.value);
                              await updateTask(task.id, {
                                priority: newPriority,
                              });
                              updateTask(task.id, { priority: newPriority });
                            }}
                          >
                            <option value={1}>P1</option>
                            <option value={2}>P2</option>
                            <option value={3}>P3</option>
                            <option value={4}>P4</option>
                          </select>

                          <div
                             className="flex-1 min-w-0 cursor-pointer"
                             onClick={() => {
                              setNotesOpen(true)
                              setActiveTask(task)
                             }}
                          >
                            <div
                              className={cn(
                                "text-lg transition-all",
                                task.is_completed
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              )}
                            >
                              {task.title}
                            </div>

                            {task.priority && (
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide",
                                  task.priority === 1 &&
                                    "bg-red-500/20 text-red-400",
                                  task.priority === 2 &&
                                    "bg-orange-500/20 text-orange-400",
                                  task.priority === 3 &&
                                    "bg-blue-500/20 text-blue-400",
                                  task.priority === 4 &&
                                    "bg-gray-500/20 text-gray-400"
                                )}
                              >
                                P{task.priority}
                              </span>
                            )}

                            <div className="flex items-center gap-3 mt-1">
                              <div className="text-xs text-zinc-400">
                                {editingTaskId === task.id ? (
                                  <input
                                    className="px-2 py-1 bg-white/20 border border-zinc-300 text-foreground rounded-md w-20 text-center"
                                    value={editTime}
                                    onChange={(e) =>
                                      setEditTime(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleSaveEst(task.id);
                                      if (e.key === "Escape") cancelEdit();
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className="cursor-pointer hover:text-foreground"
                                    onClick={() => {
                                      setEditingTaskId(task.id);
                                      setEditTime(
                                        `${task.estimated_minutes || 25}:00`
                                      );
                                    }}
                                  >
                                    Est: {task.estimated_minutes || 25} mins
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-400">
                                Created{" "}
                                {new Date(task.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {!task.is_completed && (
                          <button
                            onClick={() => startTimerForTask(task)}
                            className="relative group rounded-xl font-bold text-sm bg-gradient-to-b from-zinc-700 to-zinc-800 px-0.5 py-0.5 cursor-pointer overflow-hidden transition"
                          >
                            <span className="pointer-events-none absolute inset-0 bg-[repeating-conic-gradient(#444_0.0000001%,#555_0.0001%)]" />
                            <span className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 group-hover:bg-zinc-800 text-zinc-100 transition-colors duration-300 shadow-inner">
                              Start
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 53 58">
                                <path strokeWidth="9" stroke="currentColor" d="M44.25 36.3612L17.25 51.9497C11.5833 55.2213 4.5 51.1318 4.50001 44.5885L4.50001 13.4115C4.50001 6.86824 11.5833 2.77868 17.25 6.05033L44.25 21.6388C49.9167 24.9104 49.9167 33.0896 44.25 36.3612Z"/>
                              </svg>
                            </span>
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </BlurFade>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>

      <FocusTimer />
      <AddTaskModal
        open={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
      />

      <AddListModal
        open={addListModalOpen}
        onClose={() => setAddListModalOpen(false)}
      />

      {listToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 mb-3">
              Delete list?
            </h3>
            <p className="text-sm text-zinc-600 mb-6">
              This will remove the list and all tasks inside it.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setListToDelete(null)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    <TaskNotesDrawer
    open={notesOpen}
    task={activeTask}
    onClose={() => setNotesOpen(false)}
/>
    </div>
  );
}
