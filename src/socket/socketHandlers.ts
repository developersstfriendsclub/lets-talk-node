import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  name: string;
  socketId: string;
}

interface CallData {
  from: string;
  to: string;
}

class SocketManager {
  private io: Server;
  private users: Map<string, User> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // User registration
      socket.on('register', (userName: string) => {
        this.registerUser(socket, userName);
      });

      // Handle incoming calls
      socket.on('call-user', (data: CallData) => {
        this.handleCallUser(socket, data);
      });

      // Handle call acceptance
      socket.on('accept-call', (data: CallData) => {
        this.handleAcceptCall(socket, data);
      });

      // Handle call rejection
      socket.on('reject-call', (data: CallData) => {
        this.handleRejectCall(socket, data);
      });

      // Handle call ending
      socket.on('end-call', (data: CallData) => {
        this.handleEndCall(socket, data);
      });

      // Handle chat messages
      socket.on('send-message', (data: { from: string; to: string; message: string }) => {
        this.handleSendMessage(socket, data);
      });

      // Handle user typing
      socket.on('user-typing', (data: { from: string; to: string; isTyping: boolean }) => {
        this.handleUserTyping(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private registerUser(socket: Socket, userName: string) {
    const user: User = {
      id: socket.id,
      name: userName,
      socketId: socket.id
    };

    this.users.set(socket.id, user);
    socket.data.userName = userName;

    console.log(`User registered: ${userName} (${socket.id})`);
    
    // Broadcast updated user list to all clients
    this.broadcastUserList();
  }

  private handleCallUser(socket: Socket, data: CallData) {
    const { from, to } = data;
    const targetUser = this.findUserByName(to);

    if (targetUser) {
      console.log(`Call from ${from} to ${to}`);
      this.io.to(targetUser.socketId).emit('incoming-call', { from });
      this.io.to(socket.id).emit('ringing');
    } else {
      this.io.to(socket.id).emit('call-rejected', { message: 'User not found' });
    }
  }

  private handleAcceptCall(socket: Socket, data: CallData) {
    const { from, to } = data;
    const caller = this.findUserByName(from);

    if (caller) {
      console.log(`Call accepted: ${from} -> ${to}`);
      this.io.to(caller.socketId).emit('call-accepted', { from: to });
    }
  }

  private handleRejectCall(socket: Socket, data: CallData) {
    const { from, to } = data;
    const caller = this.findUserByName(from);

    if (caller) {
      console.log(`Call rejected: ${from} -> ${to}`);
      this.io.to(caller.socketId).emit('call-rejected', { from: to });
    }
  }

  private handleEndCall(socket: Socket, data: CallData) {
    const { from, to } = data;
    const targetUser = this.findUserByName(to);

    if (targetUser) {
      console.log(`Call ended: ${from} -> ${to}`);
      this.io.to(targetUser.socketId).emit('call-ended', { from });
      this.io.to(socket.id).emit('call-ended', { from: to });
    }
  }

  private handleSendMessage(socket: Socket, data: { from: string; to: string; message: string }) {
    const { from, to, message } = data;
    const targetUser = this.findUserByName(to);

    if (targetUser) {
      const messageData = {
        from,
        message,
        timestamp: new Date().toISOString()
      };

      this.io.to(targetUser.socketId).emit('new-message', messageData);
      this.io.to(socket.id).emit('new-message', messageData);
    }
  }

  private handleUserTyping(socket: Socket, data: { from: string; to: string; isTyping: boolean }) {
    const { from, to, isTyping } = data;
    const targetUser = this.findUserByName(to);

    if (targetUser) {
      this.io.to(targetUser.socketId).emit('user-typing', { from, isTyping });
    }
  }

  private handleDisconnect(socket: Socket) {
    const userName = socket.data.userName;
    this.users.delete(socket.id);
    
    console.log(`User disconnected: ${userName} (${socket.id})`);
    
    // Broadcast updated user list to all clients
    this.broadcastUserList();
  }

  private findUserByName(userName: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.name === userName);
  }

  private broadcastUserList() {
    const userList = Array.from(this.users.values()).map(user => user.name);
    this.io.emit('user-list', userList);
  }
}

export const setupSocketHandlers = (io: Server) => {
  new SocketManager(io);
}; 