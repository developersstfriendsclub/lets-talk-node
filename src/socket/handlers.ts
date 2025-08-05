// src/sockets/handlers.ts
import { Server, Socket } from 'socket.io';

interface User {
  socketId: string;
  userName: string;
  userId?: string;
}

const users = new Map<string, User>();
const socketToUser = new Map<string, string>();

const broadcastUserList = (io: Server) => {
  const onlineUsers = Array.from(users.keys());
  io.emit("user-list", onlineUsers);
};

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  socket.on("register", (userName: string, userId?: string) => {
    users.set(userName, { socketId: socket.id, userName, userId });
    socketToUser.set(socket.id, userName);
    broadcastUserList(io);
  });

  socket.on("call-user", ({ from, to }: { from: string; to: string }) => {
    const targetUser = users.get(to);
    const fromUser = users.get(from);
    if (targetUser && fromUser) {
      io.to(targetUser.socketId).emit("incoming-call", {
        from,
        fromUserId: fromUser.userId,
      });
      io.to(fromUser.socketId).emit("ringing");
    } else {
      io.to(fromUser?.socketId || '').emit("call-rejected", {
        reason: "User not found"
      });
    }
  });

  socket.on("accept-call", ({ from, to }) => {
    const targetUser = users.get(to);
    const fromUser = users.get(from);
    if (targetUser && fromUser) {
      io.to(targetUser.socketId).emit("call-accepted", {
        from,
        fromUserId: fromUser.userId
      });
    }
  });

  socket.on("reject-call", ({ from, to }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("call-rejected", {
        reason: "Call rejected"
      });
    }
  });

  socket.on("end-call", ({ from, to }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("call-ended");
    }
  });

  socket.on("typing", ({ from, to, isTyping }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("user-typing", { from, isTyping });
    }
  });

  socket.on("send-message", ({ from, to, message }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("new-message", {
        from,
        message,
        timestamp: Date.now()
      });
    }
  });

  socket.on("join-room", ({ roomName, userName }) => {
    socket.join(roomName);
    socket.to(roomName).emit("user-joined", { userName, socketId: socket.id });
  });

  socket.on("leave-room", ({ roomName, userName }) => {
    socket.leave(roomName);
    socket.to(roomName).emit("user-left", { userName, socketId: socket.id });
  });

  socket.on("offer", ({ to, offer }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("offer", {
        from: socketToUser.get(socket.id),
        offer
      });
    }
  });

  socket.on("answer", ({ to, answer }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("answer", {
        from: socketToUser.get(socket.id),
        answer
      });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("ice-candidate", {
        from: socketToUser.get(socket.id),
        candidate
      });
    }
  });

  socket.on("disconnect", () => {
    const userName = socketToUser.get(socket.id);
    if (userName) {
      users.delete(userName);
      socketToUser.delete(socket.id);
      broadcastUserList(io);
    }
  });
};
