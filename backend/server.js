require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/ErrorHandler');

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'JobPortal API is running 🚀' });
});

// Routes
app.use('/api/auth', require('./routes/Auth'));
app.use('/api/jobs', require('./routes/Jobs'));
app.use('/api/candidate', require('./routes/Candidates'));
app.use('/api/ai', require('./routes/AI'));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));