import express from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { RecipeModel } from '../models/recipe.model';
import { CollectionModel } from '../models/collection.model';
import { PostModel } from '../models/post.model';
import { UserModel } from '../models/user.model';
import { validateAndCleanText } from '../utils/badwords';
import { generateRecipeSlug, normalizeRecipeSteps } from '../utils/recipes';
import { RecipeStatus } from '../types/db';

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

// POST /api/users/me/recipes - user tạo công thức mới (chờ duyệt)
router.post(
  '/me/recipes',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const {
        title,
        description,
        images,
        cookingTimeMinutes,
        difficulty,
        servings,
        category,
        tags,
        ingredients,
        steps,
      } = req.body as {
        title?: string;
        description?: string;
        images?: string[];
        cookingTimeMinutes?: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        servings?: number;
        category?: string;
        tags?: string[];
        ingredients?: Array<{ name: string; amount?: string; note?: string }>;
        steps?: Array<{ order?: number; title?: string; content: string; imageUrl?: string }>;
      };

      if (!title || !title.trim()) {
        return res
          .status(400)
          .json({ message: 'Tiêu đề không được để trống.' });
      }

      if (!cookingTimeMinutes || cookingTimeMinutes < 1) {
        return res
          .status(400)
          .json({ message: 'Thời gian nấu phải lớn hơn 0.' });
      }

      if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({ message: 'Độ khó không hợp lệ.' });
      }

      if (!category || !category.trim()) {
        return res
          .status(400)
          .json({ message: 'Danh mục không được để trống.' });
      }

      if (!steps || !Array.isArray(steps) || steps.length === 0) {
        return res
          .status(400)
          .json({ message: 'Công thức phải có ít nhất một bước.' });
      }

      let slug = generateRecipeSlug(title);
      let existingRecipe = await RecipeModel.findOne({ slug });
      if (existingRecipe) {
        slug = `${slug}-${Date.now()}`;
      }

      const sortedSteps = normalizeRecipeSteps(steps);

      const recipe = await RecipeModel.create({
        authorId: userId,
        title: title.trim(),
        slug,
        description: description?.trim() || undefined,
        images: Array.isArray(images) ? images : [],
        cookingTimeMinutes,
        difficulty,
        servings: servings && servings > 0 ? servings : undefined,
        category: category.trim(),
        tags: Array.isArray(tags)
          ? tags
              .filter((t) => t && t.trim())
              .map((t) => t.trim())
          : [],
        ingredients: Array.isArray(ingredients)
          ? ingredients.filter(
              (ing) => ing && ing.name && ing.name.trim()
            )
          : [],
        steps: sortedSteps,
        status: 'pending_review',
      });

      return res.status(201).json({
        id: recipe._id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        images: recipe.images,
        cookingTimeMinutes: recipe.cookingTimeMinutes,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        category: recipe.category,
        tags: recipe.tags,
        status: recipe.status,
      });
    } catch (err) {
      console.error('Error in POST /api/users/me/recipes', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi tạo công thức.' });
    }
  }
);

// GET /api/users/me/recipes - danh sách công thức của user hiện tại
router.get(
  '/me/recipes',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as RecipeStatus | undefined;

      const filter: any = {
        authorId: new Types.ObjectId(userId),
      };

      if (status && ['draft', 'pending_review', 'published', 'rejected'].includes(status)) {
        filter.status = status;
      }

      const recipes = await RecipeModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .select(
          'title slug images cookingTimeMinutes difficulty category tags status'
        )
        .lean();

      const result = recipes.map((r: any) => ({
        id: r._id,
        title: r.title,
        slug: r.slug,
        image: r.images?.[0] || null,
        timeMinutes: r.cookingTimeMinutes,
        difficulty: r.difficulty,
        category: r.category,
        tags: r.tags || [],
        status: r.status,
      }));

      return res.json(result);
    } catch (err) {
      console.error('Error in GET /api/users/me/recipes', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi lấy danh sách công thức.' });
    }
  }
);

export const usersRouter = router;


