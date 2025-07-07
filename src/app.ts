import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { sequelize } from './config/database';

dotenv.config();

const app = express();
app.use(express.json());

// 🔥 THIS defines the base route for your API
app.use('/api/v1', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
