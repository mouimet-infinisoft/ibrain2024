import { io, Socket } from "socket.io-client";


export class SocketClient {
    private socket: Socket | null = null;

    constructor(private url: string = "http://localhost:3008") {
    }

    async sendCommand(command: string, payload: any): Promise<void> {
        if (!this.socket) {
            this.socket = io(this.url);

            // Optional: Handle connection events if needed
            this.socket.on("connect", () => {
                console.log("Connected to socket.io server");
            });

            this.socket.on("disconnect", () => {
                console.log("Disconnected from socket.io server");
            });

            this.socket.on("connect_error", (error) => {
                console.error("Socket.io connection error:", error);
                // Handle the error appropriately, e.g., retry connection
                throw error; // Re-throw the error to be handled by the caller
            });

            // Await connection before sending the command. Important to handle potential errors during connection.
            await new Promise<void>((resolve, reject) => {
                this.socket!.on("connect", resolve);
                this.socket!.on("connect_error", reject);
            });
        }

        try {
            this.socket.emit(command, payload);
            console.log(`Sent '${command}' event with data:`, payload);
        } finally {
            if (this.socket) {
                this.socket.disconnect(); // Disconnect after sending the command
                this.socket = null; //Important to set socket to null after disconnecting for subsequent reconnection
            }
        }
    }
}
