import { NextRequest, NextResponse } from "next/server";
import { asyncQueue, taskQueue } from "@/lib/queue/taskQueue";
import { createClient } from "@/utils/supabase/server";
import { createTask } from "@/app/protected/task-manager/actions/createTask";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, payload, isAsync = false } = await req.json();
    const queue = isAsync ? asyncQueue : taskQueue;

    const job = await createTask({type, payload});

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
