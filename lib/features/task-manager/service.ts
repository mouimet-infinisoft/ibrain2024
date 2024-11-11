import { setupPersistentTask } from "./persistent";

setupPersistentTask('tasks').catch((err) => {
    console.error(err);
})

export {}