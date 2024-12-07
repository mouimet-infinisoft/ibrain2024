import { getInstance, Inject, Service } from "@brainstack/inject";
import { AiService } from "../../ai/ai.service";
import { TaskQueueServer } from "../src/TaskQueueServer";
import dotenv from "dotenv";
import { io, Socket } from "socket.io-client";

dotenv.config();


class TestServer {
    constructor(@Inject public aiService: AiService) {}
}

// Server-side (processing tasks)
const server = getInstance(TaskQueueServer)
// server.createQueue({ name: 'emails' })
server.createQueue({ name: "message" })
    //   .registerProcessor('emails', 'send', async (task) => {
    //     // Send email logic
    //     console.log(`Sending email to `, task.data);
    //     return { result: 'Email sent' };
    //   })
    .registerProcessor("message", "send", async (task) => {
        // Send email logic
        try {
            const aiService = getInstance(TestServer).aiService;
            const a = await aiService.generateText(task.data.message);

            const socket: Socket = io("http://localhost:3008", { /* your socket.io options */});
        
            socket.on('connect', () => {
                console.log('Connected to Socket.IO server from background task');
                socket.emit('talk', a); // Emit the event after connecting
              
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





            console.log(`Messge to `, task.data);
            console.log(`ansewrr to `, a);
        } catch (e) {
            console.log(e);
        }
        return { result: "Message sent" };
    })
    .startWorker("message");
