// src/sockets/index.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './handlers';

export const initSocketServer = (server: HTTPServer) => {
  const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  const io = new SocketIOServer(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    cors: isProduction
      ? {
          origin: [
            'https://clientfriendclub.com',
          ],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type','Authorization'],
        }
      : {
          origin: '*',
          credentials: false,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type','Authorization'],
        },
    // Add better WebRTC support
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e8, // 100MB
  });

  // const io = new SocketIOServer(server, {
  //   path: '/socket.io',
  //   transports: ['websocket', 'polling'],
  //   cors: {
  //     origin: [
  //       'https://clientfriendclub.com',
  //       'https://*.clientfriendclub.com',
  //     ],
  //     credentials: true,
  //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //     allowedHeaders: ['Content-Type','Authorization'],
  //   },
  // });


  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    registerSocketHandlers(io, socket);
  });

  return io;
};
