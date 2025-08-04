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

import { syncDatabase } from './databaseSync';
import { initSocketServer } from './socket'; // ✅ import socket logic

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', authRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/bank-accounts', bankAccountRoutes);
app.use('/api/v1/video-calls', videoCallRoutes);

// Initialize socket server
initSocketServer(httpServer);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await syncDatabase();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
  });
};

startServer();

export default app;
