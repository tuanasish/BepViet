import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { validateAndCleanText } from '../utils/badwords';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

function signToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Thiếu email, mật khẩu hoặc tên hiển thị.' });
    }

    // Validate tên người dùng
    let cleanedName: string;
    try {
      cleanedName = validateAndCleanText(name.trim(), 'Tên hiển thị', {
        throwError: true,
        clean: false,
      });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email đã được sử dụng.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      passwordHash,
      name: cleanedName,
      role: 'user',
      status: 'active',
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('Error in /auth/register', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Thiếu email hoặc mật khẩu.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    if (user.status === 'locked') {
      return res
        .status(403)
        .json({ message: 'Tài khoản đã bị khóa, vui lòng liên hệ admin.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('Error in /auth/login', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

export const authRouter = router;


