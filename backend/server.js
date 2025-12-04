import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from "http"; 
import { initSocket } from "./utils/socket.js";

// Import routes
import authRoutes from './routes/auth.routes.js';
import hackerRoutes from './routes/hacker.routes.js';
import companyRoutes from './routes/company.routes.js';
import adminRoutes from './routes/admin.routes.js';
import feedRoutes from './routes/feed.routes.js';
import programRoutes from './routes/program.routes.js';
import reportRoutes from './routes/report.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import analyticsRoutes from "./routes/analytics.routes.js";
import leaderboardAnalyticsRoutes from './routes/leaderboardAnalytics.routes.js';
import extrasRoutes from './routes/extras.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hacker', hackerRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/analytics/leaderboard', leaderboardAnalyticsRoutes);
app.use('/api/extras', extrasRoutes);
app.use('/api/gamify', gamificationRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KAAVACH AI Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ---------------------
// DATABASE CONNECTION
// ---------------------
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing in Render environment variables!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

// -------------------------------
//  IMPORTANT PART FOR SOCKET.IO
// -------------------------------
const server = http.createServer(app);

// Initialize WebSocket Server
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
