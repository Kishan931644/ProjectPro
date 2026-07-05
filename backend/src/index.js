require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const TaskStatus = require('./models/TaskStatus');

// We will wait for the connection before seeding and starting the server
// (see below)

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/timelogs', require('./routes/timeLogRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database, seed data, and start server
connectDB().then(() => {
  // Seed the fixed set of task statuses if they don't exist yet
  const seedTaskStatuses = async () => {
    const names = ['todo', 'inprogress', 'qa', 'release'];
    try {
      await Promise.all(
        names.map((name) => TaskStatus.updateOne({ name }, { name }, { upsert: true }))
      );
      console.log('Task statuses seeded successfully');
    } catch (error) {
      console.error('Error seeding task statuses:', error);
    }
  };
  seedTaskStatuses();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
