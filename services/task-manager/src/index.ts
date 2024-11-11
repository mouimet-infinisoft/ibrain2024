import { setupPersistentTask } from "./persistent";
import { SocketServer } from "./ws/server";

setupPersistentTask("tasks").catch((err) => {
    console.error(err);
});

const port = 7777;
new SocketServer(port);
export {};
