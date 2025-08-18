// src/sockets/handlers.ts
import { Server, Socket } from 'socket.io';
import ChatMessage from '../models/chat.model';

interface User {
  socketId: string;
  userName: string;
  userId?: string;
  isOnCall: boolean; // user is an active call
}

const users = new Map<string, User>();
const socketToUser = new Map<string, string>();
const rooms = new Map<string, Set<string>>(); // roomName -> set of socketIds

const broadcastUserList = (io: Server) => {
  // const onlineUsers = Array.from(users.keys());
  const onlineUsers = Array.from(users.values()).map(user => ({
    userName: user.userName,
    userId: user.userId,
    isOnCall: user.isOnCall,
  })); // --> will show detailed status of users with the onCall feature
  io.emit("user-list", onlineUsers);
};

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  socket.on("register", (userName: string, userId?: string) => {
    users.set(userName, { socketId: socket.id, userName, userId, isOnCall: false });
    socketToUser.set(socket.id, userName);
    broadcastUserList(io);
  });

  socket.on("call-user", ({ from, to }: { from: string; to: string }) => {
    const targetUser = users.get(to);
    const fromUser = users.get(from);


    if (targetUser?.isOnCall) {
      io.to(fromUser?.socketId || '').emit("call-rejected", {
        reason: "User is busy on another call"
      });
      return; // Stop execution if the user is busy
    }

    if (targetUser && fromUser) {
      io.to(targetUser.socketId).emit("incoming-call", {
        from,
        fromUserId: fromUser.userId,
        suggestedRoom: `room_${fromUser.userId || from}`,
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
      //  both users' status to isOnCall = true for 1-to-1 calls
      targetUser.isOnCall = true;
      fromUser.isOnCall = true;
      broadcastUserList(io); // Notify all other users

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
    const fromUser = users.get(from);
    if (targetUser) {
      targetUser.isOnCall = false;
      io.to(targetUser.socketId).emit("call-ended");
    }

    if (fromUser) fromUser.isOnCall = false; // not needed but added

    broadcastUserList(io); // update
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
    const targetUser = users.get(to);
    if (targetUser?.isOnCall) {
      const fromUser = users.get(from);
      if (fromUser) {
        io.to(fromUser.socketId).emit("Call Rejected", {
          reason: "user is busy on another call"
        });
      }
      return;
    }
    if (targetUser) {
      io.to(targetUser.socketId).emit("incoming-chat", { from, fromName, roomName });
    }
  });

  socket.on("join-room", ({ roomName, userName }) => {

    const room = rooms.get(roomName);
    if (room && room.size >= 2) {
      socket.emit("room-full", {
        roomName,
        reason: "This room is already full"
      });
      return;
    }


    socket.join(roomName);

    if (!rooms.has(roomName)) rooms.set(roomName, new Set());

    rooms.get(roomName)!.add(socket.id);

    const participants = Array.from(rooms.get(roomName) || []);

    io.to(roomName).emit("room-participants", { roomName, participants });
    socket.to(roomName).emit("user-joined", { userName, socketId: socket.id });


    if ((rooms.get(roomName)?.size || 0) === 2) {
      // when the second user joins, the call is considered actove
      // set isCall to true for both
      const participantsSocketIds = Array.from(rooms.get(roomName)!);
      participantsSocketIds.forEach((sId) => {
        const participantUserName = socketToUser.get(sId);

        if (participantUserName) {
          const user = users.get(participantUserName);
          if (user) user.isOnCall = true;
        }
      });
      broadcastUserList(io);
    }

    // Notify the newly joined client it's ready to start negotiation if another peer exists
    if ((rooms.get(roomName)?.size || 0) >= 2) {
      socket.emit("room-ready", { roomName, participants });
    }
  });

  socket.on("leave-room", ({ roomName, userName }) => {
    socket.leave(roomName);
    const room = rooms.get(roomName);
    if (room) {

      const participantSocketIds = Array.from(room);
      participantSocketIds.forEach(socketId => {
        const participantUserName = socketToUser.get(socketId);
        if (participantUserName) {
          const user = users.get(participantUserName);
          if (user) user.isOnCall = false;
        }
      });

      room.delete(socket.id);
      if (room.size === 0) rooms.delete(roomName);
    }
    socket.to(roomName).emit("user-left", { userName, socketId: socket.id });
    const participants = Array.from(rooms.get(roomName) || []);
    io.to(roomName).emit("room-participants", { roomName, participants });

    broadcastUserList(io);

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
  socket.on("room-message", async ({ roomName, from, message, senderId }) => {
    // Send to everyone else in the room except the sender
    socket.to(roomName).emit("room-message", { from, message, timestamp: Date.now(), senderId });
    try {
      await ChatMessage.create({
        roomName,
        senderId: senderId ? Number(senderId) : null,
        message
      });
    } catch (err) {
      console.log(`failed to save mesage to room "${roomName}": `, err);
      socket.emit('Message-save-error', {
        reason: "Your message couldn't be saved to the chat history"
      });
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
    const userName = socketToUser.get(socket.id);

    // Cleanup from all rooms
    for (const [roomName, room] of rooms) {
      if (room.has(socket.id)) {
        room.delete(socket.id);

        if (room.size > 0) {
          const remainingSocketId = room.values().next().value as string;
          const remainingUserName = socketToUser.get(remainingSocketId);
          if (remainingUserName) {
            const remainingUser = users.get(remainingUserName);
            if (remainingUser) {
              remainingUser.isOnCall = false; // Set the other person's status to available
            }
          }
        }


        if (room.size === 0) {
          rooms.delete(roomName);
        } else {
          io.to(roomName).emit("room-participants", { roomName, participants: Array.from(room) });
        }
      }
    }

    if (userName) {
      users.delete(userName);
      socketToUser.delete(socket.id);
      broadcastUserList(io);
    }
  });
};
