// To use this file, ensure you have installed socket.io and @types/socket.io
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

interface UserSocket {
  userName: string;
  socketId: string;
}

let onlineUsers: UserSocket[] = [];

io.on('connection', (socket: Socket) => {
  // Register user
  socket.on('register', (userName: string) => {
    if (!onlineUsers.find(u => u.userName === userName)) {
      onlineUsers.push({ userName, socketId: socket.id });
    }
    io.emit('user-list', onlineUsers.map(u => u.userName));
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit('user-list', onlineUsers.map(u => u.userName));
  });

  // Call signaling events
  socket.on('call-user', (data: { from: string; to: string }) => {
    const { from, to } = data;
    const user = onlineUsers.find(u => u.userName === to);
    if (user) {
      io.to(user.socketId).emit('incoming-call', { from });
      io.to(user.socketId).emit('ringing');
    }
  });

  socket.on('accept-call', (data: { from: string; to: string }) => {
    const { from, to } = data;
    const user = onlineUsers.find(u => u.userName === from);
    if (user) {
      io.to(user.socketId).emit('call-accepted', { from: to });
    }
  });

  socket.on('reject-call', (data: { from: string; to: string }) => {
    const { from, to } = data;
    const user = onlineUsers.find(u => u.userName === from);
    if (user) {
      io.to(user.socketId).emit('call-rejected', { from: to });
    }
  });

  socket.on('end-call', (data: { from: string; to: string }) => {
    const { from, to } = data;
    const user = onlineUsers.find(u => u.userName === to);
    if (user) {
      io.to(user.socketId).emit('call-ended');
    }
  });

  // Chat events
  socket.on('send-message', (data: { from: string; to: string; message: string }) => {
    const { from, to, message } = data;
    const user = onlineUsers.find(u => u.userName === to);
    if (user) {
      io.to(user.socketId).emit('new-message', { from, message, timestamp: Date.now() });
    }
  });

  // Typing indicator
  socket.on('user-typing', (data: { from: string; to: string; isTyping: boolean }) => {
    const { from, to, isTyping } = data;
    const user = onlineUsers.find(u => u.userName === to);
    if (user) {
      io.to(user.socketId).emit('user-typing', { from, isTyping });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
}); 