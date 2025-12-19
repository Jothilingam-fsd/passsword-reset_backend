import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Enable CORS for all origins - adjust or restrict in production as needed
app.use(cors({
  origin: true,
  credentials: true
}));


// Routes for authentication and password reset
app.use('/api/auth', authRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Duplicate email error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});


// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // options can be added here if needed
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // exit process with failure
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
