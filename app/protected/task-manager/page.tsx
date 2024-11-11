import { Button } from "@/components/ui/button";
import { TaskList } from "./components/TaskList";

export default async function Page() {
  return (
    <>
      <h1>Task Manager</h1>
      <Button
        variant={"outline"}
        onClick={async () => {
          "use server";
          console.log("create task ");
        }}
      >
        Add Task
      </Button>
      <TaskList />
    </>
  );
}
