import path from "path";
import { getInstance } from "@brainstack/inject";
import { TaskQueueServer } from "../task-queue/TaskQueueServer";
import { ProcessorLoader } from "../processor-loader/ProcessorLoader";

const server = getInstance(TaskQueueServer)
server.createQueue({ name: 'message', concurrency: 3 });
server.createQueue({ name: 'workflows', concurrency: 5 });
// Load processors from a specific directory
ProcessorLoader.loadProcessors(server, path.join(__dirname, '..', 'processors'));

// Start the worker
server.startWorker('message');
server.startWorker('workflows');