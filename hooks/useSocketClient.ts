import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketClientReturn {
  socket: Socket | null;
  connected: boolean;
  registerEvent: <T>(eventName: string, callback: (data: T) => void) => () => void;
  emitEvent: <T>(eventName: string, data?: T) => void;
}

const useSocketClient = (): UseSocketClientReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const newSocket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3008", {
      withCredentials: true,
      autoConnect: false,
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setConnected(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const connectHandler = () => {
      setConnected(true);
      console.log('Socket connected');
    };

    const disconnectHandler = (reason: string) => {
      setConnected(false);
      console.log('Socket disconnected:', reason);

      setTimeout(() => {
        if (!socket.connected) {
          socket.connect();
        }
      }, 5000);
    };

    socket.on('connect', connectHandler);
    socket.on('disconnect', disconnectHandler);

    socket.connect();

    return () => {
      socket.off('connect', connectHandler);
      socket.off('disconnect', disconnectHandler);
    };
  }, [socket]);

  const registerEvent = <T>(eventName: string, callback: (data: T) => void) => {
    if (!socket) {
      console.warn("Socket not initialized. Cannot register event:", eventName);
      return () => {}; // Return a no-op function if the socket is not initialized
    }

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  };

  const emitEvent = <T>(eventName: string, data?: T) => {
    if (socket && socket.connected) {
      socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected. Event not emitted:', eventName);
    }
  };

  return { socket, connected, registerEvent, emitEvent };
};

export default useSocketClient;