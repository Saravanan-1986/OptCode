require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const compilerRoutes = require('./routes/compilerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const historyRoutes = require('./routes/historyRoutes');
const statsRoutes = require('./routes/statsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeopt';

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CodeOpt API Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);

// Error Handling
app.use(errorHandler);

// Connect to MongoDB and start server
function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`[CodeOpt Backend] Server running at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[CodeOpt Backend Error] Port ${PORT} is already in use!`);
      console.error(`An instance of the server is already running on port ${PORT}.`);
      console.error(`To stop it, close the other terminal or run: Stop-Process -Name node\n`);
      process.exit(1);
    } else {
      console.error(`Server error:`, err);
    }
  });
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`[MongoDB] Connected successfully to ${MONGO_URI}`);
    startServer();
  })
  .catch((err) => {
    console.error(`[MongoDB] Connection error:`, err.message);
    startServer();
  });
