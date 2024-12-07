import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your client's URL
    methods: ["GET", "POST"],
    credentials: true 
  }
});

app.use(cors({
  origin: "http://localhost:3000",  // Replace with your client's URL
  credentials: true 
}));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('talk', (message: string) => {
    console.log('Talk message received:', message);

    // Broadcast to all connected sockets *except* the sender:
    socket.broadcast.emit('talk', message);


  });


  socket.on('joinRoom', (room: string) => {  // Type the room parameter
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('sendMessage', (message: string) => { // Type the message parameter
    console.log('Message received:', message);
    io.to('my-room').emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


const PORT = 3008; // Use a constant for the port
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});