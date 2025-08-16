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

interface RoomData {
  participants: string[];
  createdAt: number;
}

const rooms = new Map<string, RoomData>();

interface JoinRoomPayload {
  roomId: string;
}

interface OfferPayload {
  roomId: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  roomId: string;
  answer: RTCSessionDescriptionInit;
}

interface IcecandidatePayload {
  roomId: string;
  candidate: RTCIceCandidateInit;
}

interface ChatMessagePayload {
  roomId: string;
  message: string;
  senderId: string;
}

// Universal payload parser -- This will parse the payload sting to JSON when need
function parsePayload<T>(payload: string | T, eventName: string): T {

  if (typeof payload === 'string') {

    try {
      return JSON.parse(payload) as T;

    } catch {
      throw new Error(`Invalid JSON string for ${eventName} payload`);
    }
  }

  return payload as T;
}

export const registerSocketHandlers = (io: Server, socket: Socket) => {

  // JOIN ROOM
  socket.on('join-room', (data: string | JoinRoomPayload) => {

    try {

      const payload = parsePayload<JoinRoomPayload>(data, 'join-room');

      const roomId = payload.roomId;

      if (!roomId || typeof roomId !== 'string') {
        throw new Error('Valid Room ID is required');
      }

      console.log(`Attempting to join room "${roomId}" from socket ${socket.id}`);

      const room = io.sockets.adapter.rooms.get(roomId);
      const roomSize = room ? room.size : 0;

      if (roomSize >= 2) {
        console.log(`Room "${roomId}" is full, rejecting socket ${socket.id}`);
        return socket.emit('room-full', { message: 'Room has already 2 persons' });
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { participants: [], createdAt: Date.now() });
      }

      socket.join(roomId);

      const roomData = rooms.get(roomId)!;

      if (!roomData.participants.includes(socket.id)) {
        roomData.participants.push(socket.id);
      }

      console.log(`Socket ${socket.id} successfully joined room "${roomId}", new size: ${io.sockets.adapter.rooms.get(roomId)?.size || 0}`);

      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        roomId: roomId,
        timestamp: Date.now()
      });

      socket.emit('room-joined', {
        roomId,
        socketId: socket.id,
        participantCount: roomSize + 1,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error in join-room:', error);

      socket.emit('error', {
        event: 'join-room',
        message: (error as Error).message || 'Error joining room'

      });
    }
  });

  // OFFER 
  socket.on('offer', (data: OfferPayload | string) => {

    try {

      const payload = parsePayload<OfferPayload>(data, 'offer');

      if (!payload.roomId || !payload.offer) {
        throw new Error('roomId and offer are required');
      }

      if (!socket.rooms.has(payload.roomId)) {
        throw new Error('You are not in this room');
      }

      console.log(`Relaying OFFER from ${socket.id} to room "${payload.roomId}"`);

      socket.to(payload.roomId).emit('offer', {
        offer: payload.offer,
        fromSocketId: socket.id,
        roomId: payload.roomId,
        timestamp: Date.now()
      });

      socket.emit('offer-sent', {
        roomId: payload.roomId,
        timestamp: Date.now()
      });

    } catch (error) {

      console.error('Error in offer:', error);
      socket.emit('error', {
        event: 'offer',
        message: (error as Error).message || "Error processing offer"
      });
    }

  });

  // ANSWER
  socket.on('answer', (data: AnswerPayload | string) => {

    try {

      const payload = parsePayload<AnswerPayload>(data, 'answer');

      if (!payload.roomId || !payload.answer) {
        throw new Error('roomId and answer are required');
      }

      if (!socket.rooms.has(payload.roomId)) {
        throw new Error('You are not in this room');
      }

      console.log(`Relaying ANSWER from ${socket.id} to room "${payload.roomId}"`);

      socket.to(payload.roomId).emit('answer', {
        answer: payload.answer,
        fromSocketId: socket.id,
        roomId: payload.roomId,
        timestamp: Date.now()
      });

      socket.emit('answer-sent', {
        roomId: payload.roomId,
        timestamp: Date.now()
      });

    } catch (error) {

      console.error('Error in answer:', error);
      socket.emit('error', {
        event: 'answer',
        message: (error as Error).message || 'Error processing answer'
      });
    }
  });

  // ICE CANDIDATE
  socket.on('ice-candidate', (data: IcecandidatePayload | string) => {

    try {

      const payload = parsePayload<IcecandidatePayload>(data, 'ice-candidate');

      // console.log("DEBUG raw ice-candidate payload:", data, typeof data);

      if (!payload.roomId || !payload.candidate) {
        throw new Error('roomId and candidate are required');
      }

      if (!socket.rooms.has(payload.roomId)) {
        throw new Error('You are not in this room');
      }

      console.log(`Relaying ICE candidate from ${socket.id} to room "${payload.roomId}"`);

      socket.to(payload.roomId).emit('ice-candidate', {
        candidate: payload.candidate,
        fromSocketId: socket.id,
        roomId: payload.roomId,
        timestamp: Date.now()
      });

      socket.emit('ice-candidate-sent', {
        roomId: payload.roomId,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error in ICE candidate:', error);
      socket.emit('error', {
        event: 'ice-candidate',
        message: (error as Error).message || 'Error processing ICE candidate'
      });
    }
  });

  // CHAT MESSAGE
  socket.on('chat-message', (data: string | ChatMessagePayload) => {
    try {

      let payload: ChatMessagePayload;

      if (typeof data === 'string') {

        const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);

        if (userRooms.length === 0) {
          throw new Error('Socket not in any room');
        }

        payload = {
          message: data,
          senderId: socket.id,
          roomId: userRooms[0]
        };

      } else {

        payload = parsePayload<ChatMessagePayload>(data, 'chat-message');
        payload.senderId = payload.senderId || socket.id;

      }

      if (!payload.roomId || !payload.message) {
        throw new Error('Room ID and message are required');
      }

      if (!socket.rooms.has(payload.roomId)) {
        throw new Error('You are not in this room');
      }

      console.log(`Chat message from ${payload.senderId} in room "${payload.roomId}": "${payload.message}"`);

      socket.to(payload.roomId).emit('chat-message', {
        message: payload.message,
        senderId: payload.senderId,
        roomId: payload.roomId,
        timestamp: Date.now()
      });

      socket.emit('message-sent', {
        message: payload.message,
        roomId: payload.roomId,
        timestamp: Date.now()
      });

    } catch (error) {

      console.error('Error in chat-message:', error);
      socket.emit('error', {
        event: 'chat-message',
        message: (error as Error).message || 'Error sending chat message'
      });
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {

    console.log(`socket ${socket.id} disconnected`);

    socket.rooms.forEach((room) => {

      if (room !== socket.id) {

        const roomData = rooms.get(room);

        if (roomData) {

          roomData.participants = roomData.participants.filter(id => id !== socket.id);

          if (roomData.participants.length === 0) {
            rooms.delete(room);
            console.log(`Room "${room}" deleted as it is empty`);
          }
        }

        socket.to(room).emit('user-left', {
          socketId: socket.id,
          roomId: room,
          timestamp: Date.now()
        });
      }
    });
  });


  /*
   // --> This two points are only ment for testing in postman that I've created for my ease

    // ---------- DEBUG ----------
    socket.on('debug-rooms', () => {
      const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      console.log(`🔍 Socket ${socket.id} is in rooms:`, userRooms);
  
      const roomDetails = userRooms.map(roomId => {
        const roomData = rooms.get(roomId);
        const socketRoom = io.sockets.adapter.rooms.get(roomId);
        return {
          roomId,
          participantsInMap: roomData?.participants || [],
          socketsInRoom: socketRoom ? Array.from(socketRoom) : [],
          createdAt: roomData?.createdAt
        };
      });
  
      socket.emit('debug-rooms-response', {
        socketId: socket.id,
        rooms: roomDetails,
        timestamp: Date.now()
      });
    });
  
    // ---------- TEST WEBRTC ----------
    socket.on('test-webrtc', () => {
      const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      if (userRooms.length === 0) {
        return socket.emit('test-result', {
          success: false,
          message: 'Not in any room. Join a room first.'
        });
      }
  
      const roomId = userRooms[0];
      socket.emit('test-result', {
        success: true,
        message: 'WebRTC test endpoints ready',
        testData: {
          roomId,
          socketId: socket.id,
          sampleOffer: {
            roomId,
            offer: { type: 'offer', sdp: 'test-sdp-offer-data' }
          },
          sampleAnswer: {
            roomId,
            answer: { type: 'answer', sdp: 'test-sdp-answer-data' }
          },
          sampleIceCandidate: {
            roomId,
            candidate: {
              candidate: 'test-ice-candidate',
              sdpMid: '0',
              sdpMLineIndex: 0
            }
          }
        }
      });
    });
    */
};