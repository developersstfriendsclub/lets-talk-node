// src/sockets/handlers.ts
import { Server, Socket } from 'socket.io';

interface User {
  socketId: string;
  userName: string;
  userId?: string;
}

const users = new Map<string, User>();
const socketToUser = new Map<string, string>();
const rooms = new Map<string, Set<string>>(); // roomName -> set of socketIds

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
    if (!rooms.has(roomName)) rooms.set(roomName, new Set());
    rooms.get(roomName)!.add(socket.id);
    const participants = Array.from(rooms.get(roomName) || []);
    io.to(roomName).emit("room-participants", { roomName, participants });
    socket.to(roomName).emit("user-joined", { userName, socketId: socket.id });
    // Notify the newly joined client it's ready to start negotiation if another peer exists
    if ((rooms.get(roomName)?.size || 0) >= 2) {
      socket.emit("room-ready", { roomName, participants });
    }
  });

  socket.on("leave-room", ({ roomName, userName }) => {
    socket.leave(roomName);
    const set = rooms.get(roomName);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) rooms.delete(roomName);
    }
    socket.to(roomName).emit("user-left", { userName, socketId: socket.id });
    const participants = Array.from(rooms.get(roomName) || []);
    io.to(roomName).emit("room-participants", { roomName, participants });
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

  // Room-based WebRTC signalling (multi-room)
  socket.on("room-offer", ({ roomName, offer }) => {
    // Broadcast to everyone else in the room except sender
    socket.to(roomName).emit("room-offer", { from: socket.id, offer });
  });

  socket.on("room-answer", ({ roomName, answer }) => {
    socket.to(roomName).emit("room-answer", { from: socket.id, answer });
  });

  socket.on("room-ice-candidate", ({ roomName, candidate }) => {
    socket.to(roomName).emit("room-ice-candidate", {
      from: socket.id,
      candidate
    });
  });

  // Room chat
  socket.on("room-message", ({ roomName, from, message }) => {
    io.to(roomName).emit("room-message", { from, message, timestamp: Date.now() });
  });

  // Room reject
  socket.on("room-reject", ({ roomName, reason }) => {
    socket.to(roomName).emit("room-reject", { from: socket.id, reason: reason || 'Call rejected' });
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
    // Cleanup from all rooms
    for (const [roomName, set] of rooms) {
      if (set.has(socket.id)) {
        set.delete(socket.id);
        if (set.size === 0) {
          rooms.delete(roomName);
        } else {
          io.to(roomName).emit("room-participants", { roomName, participants: Array.from(set) });
        }
      }
    }
  });
};
