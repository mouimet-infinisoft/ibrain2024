import { Processor} from "../processor-loader/ProcessorLoader";
import dotenv from "dotenv";
import { BaseMessageProcessor, MessageTask } from "./BaseMessageProcessor";
import { io, Socket } from "socket.io-client";

dotenv.config();

@Processor('message', 'send')
export class MessageProcessor extends BaseMessageProcessor {
  private socket: Socket;

  constructor() {
    super();
    this.socket = io('http://localhost:3008'); // Connect to the socket.io server

    this.socket.on('connect', () => {
      this.logger.info('Connected to socket.io server');
    });

    this.socket.on('disconnect', () => {
      this.logger.warn('Disconnected from socket.io server');
    });

    this.socket.on('connect_error', (error) => {
      this.logger.error('Socket.io connection error:', error);
    });
  }


  async process(task: MessageTask) {
    try {
      this.logger.info(`Processing send message task: `, task);

      const generatedText = await this.generateText(task.data.message);

      this.logger.info(`Generated text: ${generatedText}`);


      this.socket.emit('talk', generatedText);  // Emit the 'talk' event with the generated text

      this.logger.info(`Sent 'talk' event with data: ${generatedText}`);

      return { result: 'Message sent via socket.io' }; // Return a success message
    } catch (error) {
      this.logger.error('Error in message send processor', error);
      throw error;
    }
  }
}
