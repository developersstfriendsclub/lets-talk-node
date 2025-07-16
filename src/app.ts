import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import imageRoutes from './routes/image.routes';
import videoRoutes from './routes/video.routes';
import bankAccountRoutes from './routes/bankAccount.routes';
import { sequelize } from './config/database';
import { syncDatabase } from './databaseSync';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors()); // Allows all origins (Not recommended for production)

app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ limit: '1024mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🔥 THIS defines the base route for your API
app.use('/api/v1', authRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/bank-accounts', bankAccountRoutes);

const PORT = process.env.PORT || 5000;

// Start server after database sync
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
