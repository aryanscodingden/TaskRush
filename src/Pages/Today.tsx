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
import { Check, Plus } from "lucide-react";
import { useTimerStore } from "../Stores/timer.store";
import { Card, CardContent } from "../Components/UI/card";

export default function Today() {
  const { lists, setLists, addList, selectedListId, selectList } = useLists();
  const { tasks, setTasks, updateTask } = useTasks();

  const [addModalOpen, setAddModalOpen] = useState(false);

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

  const startTimerForTask = (task: any) => {
    const expected = task.estimated_minutes ?? 1;
    useTimerStore.getState().start(task.id, task.title, expected);
  };

  const filteredTasks = selectedListId
    ? tasks.filter((t) => t.list_id === selectedListId)
    : tasks;

  return (
    <div className="bg-background h-full w-full flex flex-col relative overflow-hidden text-foreground">
      <div className="absolute inset-0 z-0">
        <GradientBackground />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            <aside className="col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold tracking-tight">Lists</h3>
                <GlassButton size="sm" onClick={() => setAddModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                </GlassButton>
              </div>

              <div className="space-y-3">
                {lists.map((list) => (
                  <BlurFade key={list.id} className="block">
                    <div
                      onClick={() => handleSelectList(list.id)}
                      className={cn(
                        "glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-white/10",
                        selectedListId === list.id
                          ? "ring-2 ring-primary bg-white/10"
                          : ""
                      )}
                    >
                      <div>
                        <div className="font-medium">{list.name}</div>
                        <div className="text-xs text-zinc-400">
                          {tasks.filter((t) => t.list_id === list.id).length}{" "}
                          tasks
                        </div>
                      </div>
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
                  <GlassButton onClick={() => setAddModalOpen(true)}>
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

                          <div className="flex-1 min-w-0">
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

                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-zinc-400">
                                Est: {task.estimated_minutes || 25} mins
                              </span>
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
                            className="px-3 py-1 text-sm font-medium rounded-md bg-gradient-to-r from-teal-400 to-lime-400 text-black hover:opacity-90 transition"
                          >
                            Start
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
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
        }}
      />
    </div>
  );
}
