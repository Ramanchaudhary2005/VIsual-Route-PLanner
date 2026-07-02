import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './services/db.js';
import graphRoutes from './routes/graphRoutes.js';
import algorithmRoutes from './routes/algorithmRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/graphs', graphRoutes);
app.use('/api/algorithm', algorithmRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Connect to Database and start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Visual Route Planner server listening on http://localhost:${PORT}`);
  });
}

startServer();
