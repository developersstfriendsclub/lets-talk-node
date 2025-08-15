// src/sockets/handlers.ts
import { Server, Socket } from 'socket.io';

/*
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
}; */


// My logic of video call plus chat app -
/**
 * I will implement offer and answer for remote and local connection
 * shares ice-candidates
 * disconnect
 * Chat (either using map or convetional array)
 * Todos: -
 * Timely disconnects the call when the time is fineshed
 * Dynamic roomId, time and so fourth.
 */

interface OfferPayload {
  roomId: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  roomId: string;
  answer: any; // will use RTCSessionDescriptionInit type
}

interface IcecandidatePayload {
  roomId: string;
  candidate: any; // RTCIceCandidateInit type
}

export const registerSocketHandlers = (io: Server, socket: Socket) => {

  // user joined a room
  socket.on('join-room', (roomId: string) => {
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    if (roomSize >= 2) {
      return socket.emit('room-full', {
        message: "Room has already 2 persons"
      });
    }

    console.log(`Socket ${socket.id} is joining room ${roomId}`);
    // join specified room
    socket.join(roomId);

    socket.to(roomId).emit('user-joined', socket.id);

  });

  // relay an offer to a specific room
  socket.on('offer', (payload: OfferPayload) => {
    try {
      if (!payload.roomId || !payload.offer) {
        throw new Error('Invalid payload or roommId');
      }

      console.log(`Relaying offer from ${socket.id} to room ${payload.roomId}`);

      // send offer
      socket.to(payload.roomId).emit('offer', {
        offer: payload.offer,
        fromSocketId: socket.id
      });

    } catch (error) {
      socket.emit('error', {
        message: (error as Error).message || "error from offer"
      });

    }
  });

  // relay an answer to back to the specifi room
  socket.on('answer', (payload: AnswerPayload) => {
    console.log(`Relaying answer from ${socket.id} to room ${payload.roomId}`);

    // send answer
    socket.to(payload.roomId).emit('answer', {
      answer: payload.answer,
      fromSocketId: socket.id
    });
  });


  //  Relay ICE Candidates
  socket.on('ice-candidate', (payload: IcecandidatePayload) => {

    // Send the ICE candidates
    socket.to(payload.roomId).emit('ice-candidate', {
      candidate: payload.candidate,
      fromSocketId: socket.id
    });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);

    socket.rooms.forEach(room => {
      if (room !== socket.id) { // Exclude default room
        socket.to(room).emit('user-left', socket.id);
      }
    });
  });
};