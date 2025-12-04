import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth.routes';
import { recipesRouter } from './routes/recipes.routes';
import { collectionsRouter } from './routes/collections.routes';
import { usersRouter } from './routes/users.routes';
import { postsRouter } from './routes/posts.routes';
import { commentsRouter } from './routes/comments.routes';
import { uploadsRouter } from './routes/uploads.routes';
import { adminRouter } from './routes/admin.routes';
import { chatbotRouter } from './routes/chatbot.routes';
import { ensureAdminUser } from './utils/ensureAdmin';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chatbot', chatbotRouter);

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bepviet-backend' });
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment variables');
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      // Tạo tài khoản admin mặc định nếu chưa có (không seed recipe nữa)
      ensureAdminUser().catch((err) => {
        console.error('Failed to ensure admin user', err);
      });
      app.listen(PORT, () => {
        console.log(`Backend listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
    });
}


