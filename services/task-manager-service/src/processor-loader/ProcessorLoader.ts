import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { getInstance, Service } from '@brainstack/inject';
import { TaskQueueServer } from '../task-queue/TaskQueueServer';

export interface IProcessor {
    process(data: any): Promise<any>;
}

// Decorator to mark processors
export function Processor(queueName: string, action: string) {
  return (target: any) => {
    Reflect.defineMetadata('processor:queueName', queueName, target);
    Reflect.defineMetadata('processor:action', action, target);
    // Make the class injectable if it isn't already
    Service(target);
  };
}

export class ProcessorLoader {
  static loadProcessors(queueServer: TaskQueueServer, processorDir: string) {
    const processorFiles = fs.readdirSync(processorDir)
      .filter(file => file.endsWith('.processor.ts') || file.endsWith('.processor.js'));

    processorFiles.forEach(file => {
      const fullPath = path.join(processorDir, file);
      
      try {
        const processorModule = require(fullPath);

        // Find classes with processor decorator
        Object.values(processorModule).forEach(processorClass => {
          if (typeof processorClass === 'function') {
            const queueName = Reflect.getMetadata('processor:queueName', processorClass);
            const action = Reflect.getMetadata('processor:action', processorClass);

            if (queueName && action) {
              // Dynamically create an instance using getInstance
              // This will resolve all @Inject dependencies
              const processorInstance = getInstance(processorClass as new (...args: any[]) => IProcessor);
              
              queueServer.registerProcessor(
                queueName, 
                action, 
                processorInstance.process.bind(processorInstance)
              );

              console.log(`Registered processor from ${file}`);
            }
          }
        });
      } catch (error) {
        console.error(`Error loading processor from ${file}:`, error);
      }
    });
  }
}

