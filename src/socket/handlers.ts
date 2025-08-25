// src/sockets/handlers.ts
import { Server, Socket } from 'socket.io';
import ChatMessage from '../models/chat.model';
import Call from '../models/call.model';

/*
 NOTE: I only make a small improvement: when callee accepts the call, I forward the
 * suggested roomName back to the caller in the 'call-accepted' event so the caller can
 * navigate to the correct room reliably. This does not break the existing flow.
*/

interface User {
  socketId: string;
  userName: string;
  userId?: string;
}

const users = new Map<string, User>();
const socketToUser = new Map<string, string>();
const rooms = new Map<string, Set<string>>(); // roomName -> set of socketIds
const userToSocket = new Map<string, string>(); // userId -> socketId

const broadcastUserList = (io: Server) => {
  const onlineUsers = Array.from(users.keys());
  io.emit("user-list", onlineUsers);
};

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  socket.on("register", (userName: string, userId?: string) => {
    users.set(userName, { socketId: socket.id, userName, userId });
    socketToUser.set(socket.id, userName);
    if (userId) {
      userToSocket.set(userId, socket.id);
    }
    broadcastUserList(io);
    console.log(`User registered: ${userName} (${userId}) with socket ${socket.id}`);
  });

  socket.on("call-user", async ({ from, to, roomName, callType = 'video' }: { from: string; to: string; roomName?: string; callType?: 'audio' | 'video' }) => {
    console.log(`Call request from ${from} to ${to} in room ${roomName} (${callType})`);

    // Try to find target user by userId first, then by userName
    let targetUser = null;
    let targetSocketId = null;

    // Check if 'to' is a userId
    if (userToSocket.has(to)) {
      targetSocketId = userToSocket.get(to);
      if (targetSocketId) {
        const userName = socketToUser.get(targetSocketId);
        if (userName) {
          targetUser = users.get(userName);
        }
      }
    } else {
      // Check if 'to' is a userName
      targetUser = users.get(to);
      targetSocketId = targetUser?.socketId;
    }

    const fromUser = users.get(from);

    if (targetUser && targetSocketId && fromUser) {
      console.log(`Sending incoming call to ${targetUser.userName} at socket ${targetSocketId}`);

      try {
        // Create call log in database
        const call = await Call.create({
          sender_id: fromUser.userId ? Number(fromUser.userId) : 0,
          receiver_id: targetUser.userId ? Number(targetUser.userId) : 0,
          roomName: roomName || `room_${fromUser.userId || from}_${targetUser.userId || to}`,
          status: 'ringing',
          callType,
          startedAt: new Date(),
          created_by: fromUser.userId ? Number(fromUser.userId) : 0,
          updated_by: fromUser.userId ? Number(fromUser.userId) : 0
        });

        // Send incoming call notification
        io.to(targetSocketId).emit("incoming-call", {
          from: fromUser.userName,
          fromUserId: fromUser.userId,
          suggestedRoom: roomName || `room_${fromUser.userId || from}_${targetUser.userId || to}`,
          callId: call.id
        });

        // Send ringing notification to caller
        io.to(fromUser.socketId).emit("ringing");

        // Set a timeout for call acceptance
        setTimeout(async () => {
          // Check if call is still pending
          if (targetSocketId && io.sockets.sockets.has(targetSocketId)) {
            // Update call status to missed
            await call.update({
              status: 'missed',
              endedAt: new Date(),
              updated_by: fromUser.userId ? Number(fromUser.userId) : 0
            });

            io.to(fromUser.socketId).emit("call-timeout", {
              reason: "Call not answered"
            });
          }
        }, 30000); // 30 second timeout

      } catch (error) {
        console.error('Failed to create call log:', error);
        io.to(fromUser.socketId).emit("call-rejected", {
          reason: "Failed to create call log"
        });
      }
    } else {
      console.log(`Target user not found: ${to}`);
      io.to(fromUser?.socketId || '').emit("call-rejected", {
        reason: "User not found or offline"
      });
    }
  });

  socket.on("accept-call", async ({ from, to, roomName, callId }: { from: string; to: string; roomName?: string; callId?: number }) => {
    console.log(`Call accepted from ${from} to ${to}`);
    
    try {
      if (callId) {
        // Update call status to accepted
        await Call.update({
          status: 'accepted',
          answeredAt: new Date(),
          updated_by: from ? Number(from) : 0
        }, {
          where: { id: callId }
        });
      }

      const targetUser = users.get(to);
      const fromUser = users.get(from);
      if (targetUser && fromUser) {
        io.to(targetUser.socketId).emit("call-accepted", {
          from: fromUser.userName,
          fromUserId: fromUser.userId,
          roomName: roomName
        });
      }
    } catch (error) {
      console.error('Failed to update call status:', error);
    }
  });

  socket.on("reject-call", async ({ from, to, callId }: { from: string; to: string; callId?: number }) => {
    console.log(`Call rejected from ${from} to ${to}`);
    
    try {
      if (callId) {
        // Update call status to rejected
        await Call.update({
          status: 'rejected',
          endedAt: new Date(),
          updated_by: from ? Number(from) : 0
        }, {
          where: { id: callId }
        });
      }

      const targetUser = users.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("call-rejected", {
          reason: "Call rejected"
        });
      }
    } catch (error) {
      console.error('Failed to update call status:', error);
    }
  });

  socket.on("end-call", async ({ from, to, roomName, durationSeconds }: { from: string; to: string; roomName?: string; durationSeconds?: number }) => {
    console.log(`Call ended from ${from} to ${to}`);
    
    try {
      if (roomName) {
        // Update call status to ended
        await Call.update({
          status: 'ended',
          endedAt: new Date(),
          durationSeconds: durationSeconds || 0,
          updated_by: from ? Number(from) : 0
        }, {
          where: { 
            roomName,
            status: 'accepted'
          }
        });
      }

      const targetUser = users.get(to);
      if (targetUser) {
        io.to(targetUser.socketId).emit("call-ended");
      }
    } catch (error) {
      console.error('Failed to update call status:', error);
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

  // Chat invite: let one user invite another to join a specific room
  socket.on("chat-invite", ({ from, fromName, to, roomName }: { from: string; fromName?: string; to: string; roomName: string }) => {
    console.log(`Chat invite from ${from} to ${to} for room ${roomName}`);
    const targetUser = users.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit("incoming-chat", { from, fromName, roomName });
    }
  });

  socket.on("join-room", ({ roomName, userName }) => {
    console.log(`User ${userName} joining room ${roomName}`);
    socket.join(roomName);
    if (!rooms.has(roomName)) rooms.set(roomName, new Set());
    rooms.get(roomName)!.add(socket.id);
    const participants = Array.from(rooms.get(roomName) || []);

    console.log(`Room ${roomName} participants:`, participants);

    io.to(roomName).emit("room-participants", { roomName, participants });
    socket.to(roomName).emit("user-joined", { userName, socketId: socket.id });

    // Notify the newly joined client it's ready to start negotiation if another peer exists
    if ((rooms.get(roomName)?.size || 0) >= 2) {
      socket.emit("room-ready", { roomName, participants });
      console.log(`Room ${roomName} ready for negotiation with ${participants.length} participants`);
    }
  });

  socket.on("leave-room", ({ roomName, userName }) => {
    console.log(`User ${userName} leaving room ${roomName}`);
    socket.leave(roomName);
    const set = rooms.get(roomName);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) {
        rooms.delete(roomName);
        console.log(`Room ${roomName} deleted (no participants left)`);
      }
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
    console.log(`Room offer in ${roomName} from ${socket.id}`);
    // Broadcast to everyone else in the room except sender
    socket.to(roomName).emit("room-offer", { from: socket.id, offer });
  });

  socket.on("room-answer", ({ roomName, answer }) => {
    console.log(`Room answer in ${roomName} from ${socket.id}`);
    socket.to(roomName).emit("room-answer", { from: socket.id, answer });
  });

  socket.on("room-ice-candidate", ({ roomName, candidate }) => {
    console.log(`Room ICE candidate in ${roomName} from ${socket.id}`);
    socket.to(roomName).emit("room-ice-candidate", {
      from: socket.id,
      candidate
    });
  });

  // Room chat
  socket.on("room-message", async ({ roomName, from, message, senderId }) => {
    // Send to everyone else in the room except the sender
    socket.to(roomName).emit("room-message", { from, message, timestamp: Date.now(), senderId });
    
    try {
      // Save chat message to database
      await ChatMessage.create({
        roomName,
        senderId: senderId ? Number(senderId) : null,
        message,
        messageType: 'text',
        created_by: senderId ? Number(senderId) : 0,
        updated_by: senderId ? Number(senderId) : 0
      });
      console.log(`Chat message saved to database for room: ${roomName}`);
    } catch (e) {
      console.error('Failed to save chat message:', e);
    }
  });

  // Typing indicator (room scope)
  socket.on("room-typing", ({ roomName, from, isTyping }) => {
    socket.to(roomName).emit("room-typing", { from, isTyping: Boolean(isTyping) });
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
    console.log(`Socket disconnected: ${socket.id}`);
    const userName = socketToUser.get(socket.id);
    if (userName) {
      const user = users.get(userName);
      if (user && user.userId) {
        userToSocket.delete(user.userId);
      }
      users.delete(userName);
      socketToUser.delete(socket.id);
      broadcastUserList(io);
      console.log(`User ${userName} disconnected`);
    }

    // Cleanup from all rooms
    for (const [roomName, set] of rooms) {
      if (set.has(socket.id)) {
        set.delete(socket.id);
        if (set.size === 0) {
          rooms.delete(roomName);
          console.log(`Room ${roomName} deleted due to disconnect`);
        } else {
          io.to(roomName).emit("room-participants", { roomName, participants: Array.from(set) });
        }
      }
    }
  });
};
