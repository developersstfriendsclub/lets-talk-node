import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';

import authRoutes from './routes/auth.routes';
import imageRoutes from './routes/image.routes';
import videoRoutes from './routes/video.routes';
import bankAccountRoutes from './routes/bankAccount.routes';
import videoCallRoutes from './routes/videoCall.routes';
import interestsRoutes from './routes/interests.routes';
import paymentRoutes from './routes/payments.route';
import chatRoutes from './routes/chat.routes';
import callRoutes from './routes/call.routes';

import { syncDatabase } from './databaseSync';
import { initSocketServer } from './socket'; // ✅ import socket logic
import { appConfig } from './config/app';
import { handleWebhook } from './controllers/payment.controller';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
// app.use(cors());
app.use(cors({
  origin: '*', // or your frontend origin: 'https://friendsclub.clientfriendclub.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('webhook raw buffer?', Buffer.isBuffer(req.body));
    return handleWebhook(req as any, res as any);
  }
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', authRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/bank-accounts', bankAccountRoutes);
app.use('/api/v1/video-calls', videoCallRoutes);
app.use('/api/v1/interests', interestsRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/calls', callRoutes);

// Initialize socket server
initSocketServer(httpServer);

const PORT = appConfig.port;

const startServer = async () => {
  await syncDatabase();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
    console.log(`📁 File uploads will use base URL: ${appConfig.baseUrl}`);
  });
};

startServer();

export default app;
