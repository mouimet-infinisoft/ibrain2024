import { Processor } from "../processor-loader/ProcessorLoader";
import dotenv from "dotenv";
import { BaseMessageProcessor, MessageTask } from "./BaseMessageProcessor";
import { io, Socket } from "socket.io-client";
import { SupabaseService } from "../../../db/src/db";

dotenv.config();

@Processor("message", "send")
export class MessageProcessor extends BaseMessageProcessor {
  private socket: Socket;

  constructor() {
    super();
    this.socket = io("http://localhost:3008"); // Connect to the socket.io server

    this.socket.on("connect", () => {
      this.logger.info("Connected to socket.io server");
    });

    this.socket.on("disconnect", () => {
      this.logger.warn("Disconnected from socket.io server");
    });

    this.socket.on("connect_error", (error) => {
      this.logger.error("Socket.io connection error:", error);
    });
  }

  async process(task: MessageTask) {
    try {
      this.logger.info(`Processing send message task: `, task);

      const textAnswer = await this.generateText(task.data.message);

      this.logger.info(`Generated text: ${textAnswer}`);

      const messagesTable = new SupabaseService("messages");
      await messagesTable.insert({
        content: task.data.message,
        role: "user",
        conversation_id: "341f0d62-b8d8-4b17-8fdf-f9da8a042a2e",
      });
      await messagesTable.insert({
        content: textAnswer,
        role: "assistant",
        conversation_id: "341f0d62-b8d8-4b17-8fdf-f9da8a042a2e",
      });

      this.socket.emit("talk", textAnswer); // Emit the 'talk' event with the generated text

      this.logger.info(`Sent 'talk' event with data: ${textAnswer}`);

      return { result: "Answered: " + textAnswer }; // Return a success message
    } catch (error) {
      this.logger.error("Error in message send processor", error);
      throw error;
    }
  }
}
