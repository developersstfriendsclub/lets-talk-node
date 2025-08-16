// src/sockets/index.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './handlers';

export const initSocketServer = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      //origin: ["http://localhost:5000", "https://*.postman.com"], // for testing purpose.
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    registerSocketHandlers(io, socket);
  });

  return io;
};
