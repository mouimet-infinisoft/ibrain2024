import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../supabase/types";

type TSupabaseClient = ReturnType<typeof createClient<Database>>;

export class SupabaseService<T extends keyof Database['public']['Tables']> {
  private tableName: T;
  private supabase: TSupabaseClient;

  constructor(tableName: T) {
    this.tableName = tableName;
    this.supabase = createClient<Database>(
      "http://127.0.0.1:54321",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
    );
  }

  private getClient(): Promise<TSupabaseClient> {
    return Promise.resolve(this.supabase); // No need to re-initialize
  }


  async insert(data: Database['public']['Tables'][T]['Insert']) {
    const supabase = await this.getClient();
    const { data: insertedData, error } = await supabase
      .from(this.tableName)
      .insert(data as any); // No need to cast as any

    if (error) {
      throw error;
    }
    return insertedData;
  }
  async update(data: Partial<Database['public']['Tables'][T]['Update']>, id: string) { // Pass id directly
    const supabase = await this.getClient();
    const { data: updatedData, error } = await supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id); // Directly use .eq for filtering

    if (error) {
      throw error;
    }
    return updatedData;
  }

  async delete(id: string) {  // Pass id directly
    const supabase = await this.getClient();
    const { data: deletedData, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id); // Directly use .eq for filtering

    if (error) {
      throw error;
    }
    return deletedData;
  }

  async find(id?: string) { // Make id optional
    const supabase = await this.getClient();
    let query = supabase.from(this.tableName).select();
    if (id) {
      query = query.eq('id', id); // Directly use .eq for filtering
    }
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }


  async findById(id: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq("id", id)
      .single();
    if (error) {
      throw error;
    }

    return data;
  }
}

