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
  estimated_number: number;
  actual_number: number;
  sort_order: number;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

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
  const client = supabase;

  const { data, error } = await client
    .from("lists")
    .insert({
      user_id: user.id,
      name,
      color,
      sort_order: Date.now(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as List;
}

export async function updateList(id: String, updates: Partial<List>): Promise<List>
{
    const { data, error } = await supabase
    .from("lists")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data as List[];
}

export {};
