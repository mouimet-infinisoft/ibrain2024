import WebSocket from 'ws';
import ollama from "ollama";

interface Message {
    action: string;
    payload: string;
    status?: 'streaming' | 'complete';
    isStreaming?: boolean;
    isComplete?: boolean;
}

export class SocketServer {
    private server: WebSocket.Server;
    private clients: Set<WebSocket>;

    constructor(private port: number) {
        this.server = new WebSocket.Server({ port });
        this.clients = new Set();
        this.init();
    }

    private init(): void {
        this.server.on('connection', (ws: WebSocket) => {
            console.log('New client connected');
            this.clients.add(ws);

            ws.on('message', async (data: string) => {
                try {
                    const message: Message = JSON.parse(data.toString());
                    await this.handleMessage(message, ws);
                } catch (error) {
                    console.error('Error parsing message:', error);
                    this.sendErrorToClient(ws, 'Error parsing message');
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error: Error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });

        console.log(`Combined WebSocket server started on port ${this.port}`);
    }

    private async handleMessage(message: Message, sender: WebSocket): Promise<void> {
        console.log(message)


        switch (message.action) {
            case 'talk':
                // Handle broadcasting messages to other clients
                this.broadcast(message, sender);
                break;

            // case 'generate':
            //     // Handle LLM generation
            //     await this.streamLLMResponse(message.payload.message, sender);
            //     break;

            default:
                console.warn(`Unknown action: ${message.action}`);
                this.sendErrorToClient(sender, `Unknown action: ${message.action}`);
        }
    }

    private broadcast(message:Message, sender: WebSocket): void {
        this.clients.forEach(client => {
            if (client !== sender && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    private async streamLLMResponse(message: string, ws: WebSocket): Promise<void> {
        try {
            // Initialize Ollama chat
            const response = await ollama.chat({
                model: "qwen2.5-coder:7b",
                messages: [{ role: "user", content: message }],
                stream: true,
            });

            let accumulatedContent = "";

            // Stream each part of the response
            for await (const part of response) {
                // Accumulate the content
                accumulatedContent += part.message.content;

                // Send the accumulated content to the client
                this.sendToClient(ws, {
                    action: 'talk',
                    payload: {
                        message: accumulatedContent
                    }
                });
            }
        } catch (error) {
            console.error("Error streaming LLM response:", error);
            this.sendErrorToClient(ws, 'Error: Failed to generate response');
            throw error;
        }
    }

    private sendToClient(ws: WebSocket, message: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    private sendErrorToClient(ws: WebSocket, errorMessage: string): void {
        this.sendToClient(ws, {
            action: 'talk',
            payload: {
                message: errorMessage,
                error: true
            }
        });
    }
}

