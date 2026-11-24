import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Route imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
// 1. Add import at the top:
import uploadRoutes from './routes/uploadRoutes.js';

import permissionRequestRoutes from './routes/permissionRequestRoutes.js';

import auditLogRoutes from './routes/auditLogRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve static PDF uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/permission-requests', permissionRequestRoutes);


// Mount API routes
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AccessFlow API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});