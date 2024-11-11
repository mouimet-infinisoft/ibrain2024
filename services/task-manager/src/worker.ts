import { workerFactory } from "./factories/workerFactory";
import { queue } from "./queue";

export const worker = workerFactory(queue.name)
