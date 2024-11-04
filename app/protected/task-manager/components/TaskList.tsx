"use client"
import { createClient } from "@/utils/supabase/client";
import React from "react";
import { Task } from "../types";

export const TaskList = () => {
  const supabase = createClient();
  const [tasks, setTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTasks(data);
    };

    const subscription = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          fetchTasks();
        }
      )
      .subscribe();

    fetchTasks();
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tasks</h2>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">{task.type}</span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  task.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : task.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : task.status === 'active'
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {task.status}
              </span>
            </div>
            {task.error && (
              <p className="mt-2 text-sm text-red-600">{task.error}</p>
            )}
            {task?.created_at && (
              <p className="mt-2 text-sm text-gray-500">
                Created: {new Date(task.created_at).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
