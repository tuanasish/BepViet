import express from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { RecipeModel } from '../models/recipe.model';
import { CollectionModel } from '../models/collection.model';
import { PostModel } from '../models/post.model';
import { UserModel } from '../models/user.model';
import { validateAndCleanText } from '../utils/badwords';

const router = express.Router();

// GET /api/users/me/summary - thống kê cơ bản cho trang profile
router.get('/me/summary', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const objectId = new Types.ObjectId(userId);

    const [user, totalRecipes, totalCollections, totalPosts] = await Promise.all([
      UserModel.findById(userId).lean(),
      RecipeModel.countDocuments({ authorId: objectId }),
      CollectionModel.countDocuments({ userId: objectId }),
      PostModel.countDocuments({ authorId: objectId }),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      stats: {
        totalRecipes,
        totalCollections,
        totalPosts,
      },
    });
  } catch (err) {
    console.error('Error in GET /api/users/me/summary', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy thống kê người dùng.' });
  }
});

// GET /api/users/me/posts - danh sách bài viết của user hiện tại
router.get('/me/posts', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    const posts = await PostModel.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const result = posts.map((p: any) => ({
      id: p._id,
      content: p.content,
      imageUrls: p.imageUrls || [],
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      createdAt: p.createdAt,
    }));

    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/users/me/posts', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách bài viết.' });
  }
});

// PATCH /api/users/me/avatar - cập nhật ảnh đại diện
router.patch(
  '/me/avatar',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { avatarUrl } = req.body as { avatarUrl?: string };

      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res
          .status(400)
          .json({ message: 'Thiếu hoặc sai định dạng avatarUrl.' });
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { avatarUrl },
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      }

      return res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      });
    } catch (err) {
      console.error('Error in PATCH /api/users/me/avatar', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi cập nhật ảnh đại diện.' });
    }
  }
);

// PATCH /api/users/me - cập nhật thông tin profile
router.patch(
  '/me',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { name, email } = req.body as { name?: string; email?: string };

      const updateData: any = {};

      if (name !== undefined) {
        if (!name || !name.trim()) {
          return res.status(400).json({ message: 'Tên không được để trống.' });
        }
        try {
          const cleanedName = validateAndCleanText(name.trim(), 'Tên hiển thị', {
            throwError: true,
            clean: false,
          });
          updateData.name = cleanedName;
        } catch (err: any) {
          return res.status(400).json({ message: err.message });
        }
      }

      if (email !== undefined) {
        if (!email || !email.trim()) {
          return res.status(400).json({ message: 'Email không được để trống.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          return res.status(400).json({ message: 'Email không hợp lệ.' });
        }
        // Kiểm tra email đã tồn tại chưa (trừ chính user này)
        const existingUser = await UserModel.findOne({
          email: email.trim(),
          _id: { $ne: userId },
        });
        if (existingUser) {
          return res.status(409).json({ message: 'Email đã được sử dụng.' });
        }
        updateData.email = email.trim();
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      }

      return res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      });
    } catch (err) {
      console.error('Error in PATCH /api/users/me', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi cập nhật thông tin.' });
    }
  }
);

// PATCH /api/users/me/password - đổi mật khẩu
router.patch(
  '/me/password',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới.' });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      }

      // Kiểm tra mật khẩu hiện tại
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng.' });
      }

      // Hash mật khẩu mới
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Cập nhật mật khẩu
      await UserModel.findByIdAndUpdate(userId, {
        passwordHash: newPasswordHash,
      });

      return res.json({ message: 'Đổi mật khẩu thành công.' });
    } catch (err) {
      console.error('Error in PATCH /api/users/me/password', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi đổi mật khẩu.' });
    }
  }
);

export const usersRouter = router;


