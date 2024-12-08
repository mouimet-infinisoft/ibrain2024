import { Job } from "bullmq";
import { BaseTask } from "../types";


export class TaskFactory {
  static create<T extends BaseTask>(
    type: T['type'],
    action: T['action'],
    data: T['data']
  ): Job['data'] {
    return {
      type,
      action,
      data,
      createdAt: Date.now()
    };
  }
}
