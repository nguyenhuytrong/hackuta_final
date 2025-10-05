// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const weeklySummaryRoutes = require('./routes/weeklySummaryRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

const startSchedulers = require('./chatbot/unifiedScheduler');

dotenv.config();

const app = express();

// ---------------- Middleware ----------------
app.use(express.json()); // JSON body parser

// Allow frontend to connect in dev
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: '*' }));
}

// ---------------- Connect MongoDB and start server ----------------
connectDB().then(() => {
  console.log('✅ MongoDB connected successfully');

  // Start cron jobs
  //startSchedulers();

  // ---------------- API routes ----------------
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/income', incomeRoutes);
  app.use('/api/v1/expense', expenseRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/weekly-summary', weeklySummaryRoutes);
  app.use('/api/v1/gemini', geminiRoutes);

  console.log('[Gemini] server started successfully');

  // ---------------- Serve uploads ----------------
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // ---------------- Serve frontend build (production) ----------------
  const frontendPath = path.join(__dirname, '../frontend/expense-tracker/dist');
  app.use(express.static(frontendPath));

  // SPA fallback for React Router
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  // ---------------- Start server ----------------
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(
      `✅ Server running on port ${PORT} (${
        process.env.NODE_ENV || 'development'
      })`
    );
  });
});
