import { getInstance, Inject } from "@brainstack/inject";
import MultiQueueTaskManager from "./task.manager.service";
import { Redis } from "ioredis";
import { io, Socket } from "socket.io-client";
import { AiService } from "../../ai/ai.service";
import dotenv from 'dotenv';

dotenv.config();


// Create Redis connection
const redisConnection = {
    host: "192.168.10.2",
    port: 6379,
};

class TestServer {
    constructor(@Inject public aiService: AiService) {}
}

const run = async () => {
    // Create a multi-queue task manager
    const taskManager = new MultiQueueTaskManager(redisConnection);
    const aiService = getInstance(TestServer).aiService

    taskManager
        .createQueue({
            name: "realtime-tasks",
            concurrency: 5,
            defaultRetryAttempts: 3,
        })
        .createQueue({
            name: "background-tasks",
            concurrency: 2,
            defaultRetryAttempts: 1,
        });

    // Register processors for different queues
    taskManager
        .registerProcessor("realtime-tasks", "send-message", async (task) => {
            // Realtime message sending logic
            console.log("Sending message:", task);
            return { result: "Message sent successfully" };
        })
        .registerProcessor("background-tasks", "cleanup", async (task) => {
            console.log("Talking:", task);

            const answer = await aiService.generateText("Say hello to the user in a funny way!")
            // Create a Socket.IO client connection *inside* the processor
            const socket: Socket = io("http://localhost:3008", { /* your socket.io options */});
        
            socket.on('connect', () => {
                console.log('Connected to Socket.IO server from background task');
                socket.emit('talk', answer); // Emit the event after connecting
              
                // Disconnect after emitting the event (optional)
                socket.disconnect();  
            });
        
        
        
            socket.on('disconnect', (reason) => {
                console.log('Disconnected from Socket.IO server:', reason)
            })
        
        
        
            socket.on("connect_error", (err) => {
              console.error("Socket.IO connection error:", err);
              // Handle the connection error appropriately (e.g., retry, log, etc.)
            });
        
        
            return { result: "Talk attempt completed" }; // Changed the message slightly
          });

    // Start workers for each queue
    taskManager.startWorker("realtime-tasks");
    taskManager.startWorker("background-tasks");

    // Enqueue tasks with different priorities
    const messageTask = {
        type: "REALTIME",
        action: "send-message",
        priority: "high" as const,
        payload: {/* message details */},
    };

    const backgroundTask = {
        type: "BACKGROUND",
        action: "cleanup",
        priority: "low" as const,
        payload: {/* cleanup details */},
    };

    // Enqueue tasks to specific queues
    await taskManager.enqueueTask("realtime-tasks", messageTask);
    await taskManager.enqueueTask("background-tasks", backgroundTask);

    // Later, when done
    await taskManager.close();
};

run().catch((error) => {
    console.error("Error:", error);
});