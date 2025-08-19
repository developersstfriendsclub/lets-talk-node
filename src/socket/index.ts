// src/sockets/index.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './handlers';

export const initSocketServer = (server: HTTPServer) => {
  // const io = new SocketIOServer(server, {
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"]
  //   }
  // });

  const io = new SocketIOServer(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    cors: {
      origin: [
        'https://clientfriendclub.com',
        'https://*.clientfriendclub.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
    },
  });


  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    registerSocketHandlers(io, socket);
  });

  return io;
};
