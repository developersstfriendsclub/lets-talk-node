import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { sequelize } from './config/database';
import { syncDatabase } from './databaseSync';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors()); // Allows all origins (Not recommended for production)

app.use(express.json());

// 🔥 THIS defines the base route for your API
app.use('/api/v1', authRoutes);

const PORT = process.env.PORT || 5000;

// Start server after database sync
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
