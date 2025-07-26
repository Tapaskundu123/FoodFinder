import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import ConnectDB from './DB/MongoDB.js';
import authRoutes from './routes/auth.routes.js';
import vendorRouter from './routes/vendor.routes.js';

ConnectDB(); // connect to Database

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Adjust for frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  }
});

// ✅ Core Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// ✅ Log middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ✅ Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
app.get('/', (_, res) => {
  res.send("API working at '/' route");
});

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRouter);


// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('locationUpdate', (coords) => {
    console.log(`📍 Location from ${socket.id}:`, coords);
    socket.broadcast.emit('locationUpdate', coords);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
