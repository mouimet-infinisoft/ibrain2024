// import { setupPersistentTask } from "@/lib/features/task-manager/persistent";
// import logger from "@/lib/monitoring/logger";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  // setupPersistentTask("tasks")
  //   .then(() => {
  //     logger.info(`Task Persistcy Initialized Successfully.`);
  //   })
  //   .catch((e: any) => {
  //     logger.error(`Task Persistcy Initialization  Failed. Error: `, e);
  //   });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <div className="flex-1 w-full flex flex-col gap-12">Home</div>;
}
