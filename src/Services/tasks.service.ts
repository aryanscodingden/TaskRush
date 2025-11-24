import { supabase } from "./supabase";

if (!supabase) {
  throw new Error('Supabase client is not initialized');
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  list_id: string;
  title: string;
  notes?: string;
  is_completed: boolean;
  estimated_minutes: number;
  actual_minutes: number;
  sort_order: number;
  scheduled_date?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

const getSortOrderValue = () => Math.floor(Date.now() / 1000);

//Lists
export async function getLists(): Promise<List[]> {
  if (!supabase) throw new Error("Supabase client not initialized");
   const { data, error } = await supabase
    .from("lists")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data as List[];
}

export async function createList(
  name: string,
  color: string = "#3b82f6"
): Promise<List> {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) throw new Error("Not Authenticated");

  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      name,
      color,
      sort_order: getSortOrderValue(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as List;

}

export async function updateList(id: string, updates: Partial<List>): Promise<List> {
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from("lists")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as List;
}

export async function deleteList(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase client not initialized");
  const { error } = await supabase.from('lists').delete().eq('id', id);
  if (error) throw error;
}
export async function getTasks(listId?: string): Promise<Task[]> {
  if (!supabase) throw new Error("Supabase client not initialized");
  let query = supabase.from('tasks').select('*').order('sort_order');
  if (listId) {
    query = query.eq('list_id', listId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

export async function createTask(task: {
    title: string;
    list_id: string;
    estimated_minutes: number;
}): Promise<Task> {
    if (!supabase) throw new Error("Supabase client not initialized");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not Authenticated");

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task.title,
        list_id: task.list_id,
        estimated_minutes: task.estimated_minutes || 25,
        actual_minutes: 0,
        is_completed: false,
        sort_order: getSortOrderValue(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Task;
}

export async function updateTask(id: string, updates:Partial<Task>): Promise<Task> { 
     const { data, error } = await supabase!
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}


export async function toggleTaskComplete(id: string, isCompleted: boolean): Promise<Task> {
  const updates: any = {
    is_completed: isCompleted,
    updated_at: new Date().toISOString(),
  };

  if (isCompleted) {
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed_at = null;
  }

  if (!supabase) throw new Error("Supabase client not initialized");
  
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase client not initialized");
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

