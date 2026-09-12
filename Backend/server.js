import './config/env.js';
import express from 'express';
import connectDB from './database/db.js';
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import mediaRoute from './routes/mediaRoutes.js';
import readingContentRoute from './routes/readingContentRoutes.js';
import learningProgressRoute from './routes/learningProgressRoutes.js';
import dashboardRoute from './routes/dashboardRoutes.js';
import { uploadsRoot } from './config/cloudinary.js';
import cors from 'cors';
import './config/passport.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
    return callback(null, allowed);
  },
  credentials: true,
}));

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/media', mediaRoute);
app.use('/reading-content', readingContentRoute);
app.use('/learning-progress', learningProgressRoute);
app.use('/dashboard', dashboardRoute);
app.use('/uploads', express.static(uploadsRoot));

app.get('/', (req, res) => {
  res.json({
    service: 'AccessLearn API',
    status: 'running',
    frontend: 'http://localhost:5173',
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(400).json({ success: false, message: error.message || 'Request failed' });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening at port ${PORT}`);
});