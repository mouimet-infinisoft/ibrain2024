import { Button } from "@/components/ui/button";
import { createTask } from "./actions/createTask";
import { TaskList } from "./components/TaskList";

export default async function Page() {
  return (
    <>
      <h1>Task Manager</h1>
      <Button
        variant={"outline"}
        onClick={async () => {
          "use server";
          const j = await createTask({ type: "sendMessage", payload: "doguette" });
          console.log("create task ", j);
        }}
      >
        Add Task
      </Button>
      <TaskList />
    </>
  );
}
