import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface User {
  socketId: string;
  userName: string;
  userId?: string;
}

export class SocketService {
  private io: SocketIOServer;
  private users: Map<string, User> = new Map(); // userName -> User
  private socketToUser: Map<string, string> = new Map(); // socketId -> userName

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("New socket connected:", socket.id);

      // Register user
      socket.on("register", (userName: string, userId?: string) => {
        this.users.set(userName, {
          socketId: socket.id,
          userName,
          userId
        });
        this.socketToUser.set(socket.id, userName);
        
        console.log("Registered:", userName, socket.id);
        
        // Broadcast updated user list to all clients
        this.broadcastUserList();
      });

      // Call user
      socket.on("call-user", ({ from, to }: { from: string; to: string }) => {
        const targetUser = this.users.get(to);
        const fromUser = this.users.get(from);
        
        if (targetUser && fromUser) {
          this.io.to(targetUser.socketId).emit("incoming-call", { 
            from,
            fromUserId: fromUser.userId 
          });
          this.io.to(fromUser.socketId).emit("ringing");
          console.log(`Call from ${from} to ${to}`);
        } else {
          this.io.to(fromUser?.socketId || '').emit("call-rejected", { 
            reason: "User not found" 
          });
          console.log(`User ${to} not found`);
        }
      });

      // Accept call
      socket.on("accept-call", ({ from, to }: { from: string; to: string }) => {
        const targetUser = this.users.get(to);
        const fromUser = this.users.get(from);
        
        if (targetUser && fromUser) {
          this.io.to(targetUser.socketId).emit("call-accepted", { 
            from,
            fromUserId: fromUser.userId 
          });
          console.log(`Call accepted from ${to} to ${from}`);
        }
      });

      // Reject call
      socket.on("reject-call", ({ from, to }: { from: string; to: string }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("call-rejected", { 
            reason: "Call rejected" 
          });
          console.log(`Call rejected from ${to} to ${from}`);
        }
      });

      // End call
      socket.on("end-call", ({ from, to }: { from: string; to: string }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("call-ended");
          console.log(`Call ended from ${from} to ${to}`);
        }
      });

      // User typing indicator
      socket.on("typing", ({ from, to, isTyping }: { from: string; to: string; isTyping: boolean }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("user-typing", { from, isTyping });
        }
      });

      // Send message
      socket.on("send-message", ({ from, to, message }: { from: string; to: string; message: string }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("new-message", { 
            from, 
            message, 
            timestamp: Date.now() 
          });
        }
      });

      // Join video room
      socket.on("join-room", ({ roomName, userName }: { roomName: string; userName: string }) => {
        socket.join(roomName);
        socket.to(roomName).emit("user-joined", { userName, socketId: socket.id });
        console.log(`${userName} joined room: ${roomName}`);
      });

      // Leave video room
      socket.on("leave-room", ({ roomName, userName }: { roomName: string; userName: string }) => {
        socket.leave(roomName);
        socket.to(roomName).emit("user-left", { userName, socketId: socket.id });
        console.log(`${userName} left room: ${roomName}`);
      });

      // Video/audio stream signaling
      socket.on("offer", ({ to, offer }: { to: string; offer: any }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("offer", { 
            from: this.socketToUser.get(socket.id),
            offer 
          });
        }
      });

      socket.on("answer", ({ to, answer }: { to: string; answer: any }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("answer", { 
            from: this.socketToUser.get(socket.id),
            answer 
          });
        }
      });

      socket.on("ice-candidate", ({ to, candidate }: { to: string; candidate: any }) => {
        const targetUser = this.users.get(to);
        if (targetUser) {
          this.io.to(targetUser.socketId).emit("ice-candidate", { 
            from: this.socketToUser.get(socket.id),
            candidate 
          });
        }
      });

      // Disconnect
      socket.on("disconnect", () => {
        const userName = this.socketToUser.get(socket.id);
        if (userName) {
          this.users.delete(userName);
          this.socketToUser.delete(socket.id);
          console.log("User disconnected:", userName);
          
          // Broadcast updated user list to all clients
          this.broadcastUserList();
        }
      });
    });
  }

  private broadcastUserList() {
    const onlineUsers = Array.from(this.users.keys());
    this.io.emit("user-list", onlineUsers);
  }

  public getIO() {
    return this.io;
  }

  public getOnlineUsers() {
    return Array.from(this.users.keys());
  }
} 