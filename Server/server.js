import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import ConnectDB from './DB/MongoDB.js';
import authRoutes from './routes/auth.routes.js'
import vendorRoutes from './routes/vendor.routes.js'

ConnectDB();//connect to Database
const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', // adjust if needed for frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Routes
app.get('/', (_, res) => {
  res.send("API working at '/' route");
});

//app endpoints
app.use('/api/auth',authRoutes);
app.use('/api/vendor',vendorRoutes)

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

