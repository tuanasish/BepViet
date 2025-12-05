import express from 'express';
import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { RecipeModel } from '../models/recipe.model';
import { PostModel } from '../models/post.model';
import { CommentModel } from '../models/comment.model';
import { LikeModel } from '../models/like.model';
import {
  authMiddleware,
  adminMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { generateRecipeSlug, normalizeRecipeSteps } from '../utils/recipes';

const router = express.Router();

// Tất cả routes admin đều cần authMiddleware và adminMiddleware
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/overview - tổng quan thống kê
router.get('/overview', async (_req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalRecipes = await RecipeModel.countDocuments();
    const totalPosts = await PostModel.countDocuments();
    const pendingRecipes = await RecipeModel.countDocuments({ status: 'pending_review' });

    // Tính số bài viết mới hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const postsToday = await PostModel.countDocuments({
      createdAt: { $gte: today },
    });

    // Tính số công thức mới hôm nay
    const recipesToday = await RecipeModel.countDocuments({
      createdAt: { $gte: today },
    });

    // Tính số người dùng mới hôm nay
    const usersToday = await UserModel.countDocuments({
      createdAt: { $gte: today },
    });

    return res.json({
      totalUsers,
      totalRecipes,
      totalPosts,
      pendingRecipes,
      postsToday,
      recipesToday,
      usersToday,
    });
  } catch (err) {
    console.error('Error in GET /api/admin/overview', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy thống kê tổng quan.' });
  }
});

// GET /api/admin/recipes/pending - danh sách công thức chờ duyệt
router.get('/recipes/pending', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const recipes = await RecipeModel.find({ status: 'pending_review' })
      .populate('authorId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RecipeModel.countDocuments({ status: 'pending_review' });

    const result = recipes.map((r: any) => ({
      id: r._id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      images: r.images || [],
      cookingTimeMinutes: r.cookingTimeMinutes,
      difficulty: r.difficulty,
      category: r.category,
      tags: r.tags || [],
      authorName: r.authorId?.name || 'Ẩn danh',
      authorEmail: r.authorId?.email || '',
      authorAvatarUrl: r.authorId?.avatarUrl || null,
      createdAt: r.createdAt,
    }));

    return res.json({
      recipes: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error in GET /api/admin/recipes/pending', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách công thức chờ duyệt.' });
  }
});

// POST /api/admin/recipes/:id/approve - duyệt công thức
router.post('/recipes/:id/approve', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID công thức không hợp lệ.' });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức.' });
    }

    if (recipe.status !== 'pending_review') {
      return res
        .status(400)
        .json({ message: 'Công thức này không ở trạng thái chờ duyệt.' });
    }

    recipe.status = 'published';
    await recipe.save();

    return res.json({
      message: 'Đã duyệt công thức thành công.',
      recipe: {
        id: recipe._id,
        title: recipe.title,
        status: recipe.status,
      },
    });
  } catch (err) {
    console.error('Error in POST /api/admin/recipes/:id/approve', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi duyệt công thức.' });
  }
});

// POST /api/admin/recipes/:id/reject - từ chối công thức
router.post('/recipes/:id/reject', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID công thức không hợp lệ.' });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức.' });
    }

    if (recipe.status !== 'pending_review') {
      return res
        .status(400)
        .json({ message: 'Công thức này không ở trạng thái chờ duyệt.' });
    }

    recipe.status = 'rejected';
    await recipe.save();

    return res.json({
      message: 'Đã từ chối công thức.',
      recipe: {
        id: recipe._id,
        title: recipe.title,
        status: recipe.status,
        rejectionReason: reason || null,
      },
    });
  } catch (err) {
    console.error('Error in POST /api/admin/recipes/:id/reject', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi từ chối công thức.' });
  }
});

// GET /api/admin/users - danh sách người dùng
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.status = status;
    }

    const users = await UserModel.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UserModel.countDocuments(query);

    const result = users.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || null,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));

    return res.json({
      users: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error in GET /api/admin/users', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách người dùng.' });
  }
});

// POST /api/admin/users/:id/lock - khóa tài khoản
router.post('/users/:id/lock', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    if (user.role === 'admin') {
      return res
        .status(400)
        .json({ message: 'Không thể khóa tài khoản admin.' });
    }

    user.status = 'locked';
    await user.save();

    return res.json({
      message: 'Đã khóa tài khoản thành công.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    console.error('Error in POST /api/admin/users/:id/lock', err);
    return res.status(500).json({ message: 'Lỗi server khi khóa tài khoản.' });
  }
});

// POST /api/admin/users/:id/unlock - mở khóa tài khoản
router.post('/users/:id/unlock', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    user.status = 'active';
    await user.save();

    return res.json({
      message: 'Đã mở khóa tài khoản thành công.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    console.error('Error in POST /api/admin/users/:id/unlock', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi mở khóa tài khoản.' });
  }
});

// GET /api/admin/recipes/:id - chi tiết công thức (admin có thể xem bất kỳ status nào)
router.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID công thức không hợp lệ.' });
    }

    const recipe = await RecipeModel.findById(id)
      .populate('authorId', 'name email avatarUrl')
      .lean();

    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức.' });
    }

    const result: any = {
      id: recipe._id,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      images: recipe.images || [],
      cookingTimeMinutes: recipe.cookingTimeMinutes,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      category: recipe.category,
      tags: recipe.tags || [],
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      status: recipe.status,
      authorName: (recipe as any).authorId?.name || 'Ẩn danh',
      authorEmail: (recipe as any).authorId?.email || '',
      createdAt: recipe.createdAt,
    };

    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/admin/recipes/:id', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy chi tiết công thức.' });
  }
});

// GET /api/admin/recipes - danh sách tất cả công thức (cho admin)
router.get('/recipes', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const search = (req.query.search as string) || '';

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const recipes = await RecipeModel.find(query)
      .populate('authorId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RecipeModel.countDocuments(query);

    const result = recipes.map((r: any) => ({
      id: r._id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      images: r.images || [],
      cookingTimeMinutes: r.cookingTimeMinutes,
      difficulty: r.difficulty,
      category: r.category,
      tags: r.tags || [],
      status: r.status,
      authorName: r.authorId?.name || 'Ẩn danh',
      authorEmail: r.authorId?.email || '',
      createdAt: r.createdAt,
    }));

    return res.json({
      recipes: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error in GET /api/admin/recipes', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách công thức.' });
  }
});

// GET /api/admin/posts - danh sách tất cả bài đăng (cho admin)
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await PostModel.find(query)
      .populate('authorId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PostModel.countDocuments(query);

    const result = posts.map((p: any) => ({
      id: p._id,
      authorId: p.authorId?._id?.toString() || '',
      authorName: p.authorId?.name || 'Ẩn danh',
      authorEmail: p.authorId?.email || '',
      authorAvatarUrl: p.authorId?.avatarUrl || null,
      content: p.content,
      imageUrls: p.imageUrls || [],
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      createdAt: p.createdAt,
    }));

    return res.json({
      posts: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error in GET /api/admin/posts', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách bài đăng.' });
  }
});

// DELETE /api/admin/posts/:id - xóa bài đăng (admin)
router.delete('/posts/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID bài đăng không hợp lệ.' });
    }

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài đăng.' });
    }

    // Xóa tất cả comments và likes liên quan
    await CommentModel.deleteMany({
      targetType: 'post',
      targetId: id,
    });

    await LikeModel.deleteMany({
      targetType: 'post',
      targetId: id,
    });

    // Xóa bài đăng
    await post.deleteOne();

    return res.json({
      message: 'Đã xóa bài đăng thành công.',
    });
  } catch (err) {
    console.error('Error in DELETE /api/admin/posts/:id', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi xóa bài đăng.' });
  }
});

// POST /api/admin/recipes - tạo công thức mới (admin)
router.post('/recipes', async (req: AuthenticatedRequest, res) => {
  try {
    const adminId = req.user!.userId;
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
      status,
    } = req.body as {
      title: string;
      description?: string;
      images?: string[];
      cookingTimeMinutes: number;
      difficulty: 'easy' | 'medium' | 'hard';
      servings?: number;
      category: string;
      tags?: string[];
      ingredients?: Array<{ name: string; amount?: string; note?: string }>;
      steps?: Array<{ order: number; title?: string; content: string; imageUrl?: string }>;
      status?: 'draft' | 'pending_review' | 'published' | 'rejected';
    };

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Tiêu đề không được để trống.' });
    }

    if (!cookingTimeMinutes || cookingTimeMinutes < 1) {
      return res.status(400).json({ message: 'Thời gian nấu phải lớn hơn 0.' });
    }

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ message: 'Độ khó không hợp lệ.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Danh mục không được để trống.' });
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ message: 'Công thức phải có ít nhất một bước.' });
    }

    // Tạo slug từ title
    let slug = generateRecipeSlug(title);
    // Kiểm tra slug có trùng không
    let existingRecipe = await RecipeModel.findOne({ slug });
    if (existingRecipe) {
      slug = `${slug}-${Date.now()}`;
    }

    // Sắp xếp và validate steps
    const sortedSteps = normalizeRecipeSteps(steps);

    // Tạo công thức mới
    const recipe = await RecipeModel.create({
      authorId: adminId,
      title: title.trim(),
      slug,
      description: description?.trim() || undefined,
      images: Array.isArray(images) ? images : [],
      cookingTimeMinutes,
      difficulty,
      servings: servings && servings > 0 ? servings : undefined,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags.filter((t) => t && t.trim()).map((t) => t.trim()) : [],
      ingredients: Array.isArray(ingredients)
        ? ingredients.filter((ing) => ing && ing.name && ing.name.trim())
        : [],
      steps: sortedSteps,
      status: status || 'published', // Admin tạo mặc định là published
    });

    const createdRecipe = await RecipeModel.findById(recipe._id)
      .populate('authorId', 'name email avatarUrl')
      .lean();

    return res.status(201).json({
      message: 'Đã tạo công thức thành công.',
      recipe: {
        id: createdRecipe!._id,
        title: createdRecipe!.title,
        slug: createdRecipe!.slug,
        description: createdRecipe!.description,
        images: createdRecipe!.images,
        cookingTimeMinutes: createdRecipe!.cookingTimeMinutes,
        difficulty: createdRecipe!.difficulty,
        servings: createdRecipe!.servings,
        category: createdRecipe!.category,
        tags: createdRecipe!.tags,
        ingredients: createdRecipe!.ingredients,
        steps: createdRecipe!.steps,
        status: createdRecipe!.status,
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/recipes', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng thử lại.' });
    }
    return res.status(500).json({ message: 'Lỗi server khi tạo công thức.' });
  }
});

// PUT /api/admin/recipes/:id - sửa công thức (admin)
router.put('/recipes/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
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
      status,
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
      steps?: Array<{ order: number; title?: string; content: string; imageUrl?: string }>;
      status?: 'draft' | 'pending_review' | 'published' | 'rejected';
    };

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID công thức không hợp lệ.' });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức.' });
    }

    // Validate và cập nhật các trường
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Tiêu đề không được để trống.' });
      }
      recipe.title = title.trim();
      // Tạo slug mới nếu title thay đổi
      const newSlug = generateRecipeSlug(title);
      // Kiểm tra slug có trùng không (trừ chính nó)
      const existingRecipe = await RecipeModel.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingRecipe) {
        recipe.slug = `${newSlug}-${Date.now()}`;
      } else {
        recipe.slug = newSlug;
      }
    }

    if (description !== undefined) {
      recipe.description = description?.trim() || undefined;
    }

    if (images !== undefined) {
      recipe.images = Array.isArray(images) ? images : [];
    }

    if (cookingTimeMinutes !== undefined) {
      if (cookingTimeMinutes < 1) {
        return res.status(400).json({ message: 'Thời gian nấu phải lớn hơn 0.' });
      }
      recipe.cookingTimeMinutes = cookingTimeMinutes;
    }

    if (difficulty !== undefined) {
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({ message: 'Độ khó không hợp lệ.' });
      }
      recipe.difficulty = difficulty;
    }

    if (servings !== undefined) {
      recipe.servings = servings > 0 ? servings : undefined;
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return res.status(400).json({ message: 'Danh mục không được để trống.' });
      }
      recipe.category = category.trim();
    }

    if (tags !== undefined) {
      recipe.tags = Array.isArray(tags) ? tags.filter((t) => t && t.trim()).map((t) => t.trim()) : [];
    }

    if (ingredients !== undefined) {
      recipe.ingredients = Array.isArray(ingredients)
        ? ingredients.filter((ing) => ing && ing.name && ing.name.trim())
        : [];
    }

    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({ message: 'Công thức phải có ít nhất một bước.' });
      }
      // Sắp xếp steps theo order và validate
      recipe.steps = normalizeRecipeSteps(steps);
    }

    if (status !== undefined) {
      if (!['draft', 'pending_review', 'published', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
      }
      recipe.status = status;
    }

    await recipe.save();

    const updatedRecipe = await RecipeModel.findById(id)
      .populate('authorId', 'name email avatarUrl')
      .lean();

    return res.json({
      message: 'Đã cập nhật công thức thành công.',
      recipe: {
        id: updatedRecipe!._id,
        title: updatedRecipe!.title,
        slug: updatedRecipe!.slug,
        description: updatedRecipe!.description,
        images: updatedRecipe!.images,
        cookingTimeMinutes: updatedRecipe!.cookingTimeMinutes,
        difficulty: updatedRecipe!.difficulty,
        servings: updatedRecipe!.servings,
        category: updatedRecipe!.category,
        tags: updatedRecipe!.tags,
        ingredients: updatedRecipe!.ingredients,
        steps: updatedRecipe!.steps,
        status: updatedRecipe!.status,
      },
    });
  } catch (err: any) {
    console.error('Error in PUT /api/admin/recipes/:id', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng thử lại.' });
    }
    return res.status(500).json({ message: 'Lỗi server khi cập nhật công thức.' });
  }
});

// DELETE /api/admin/recipes/:id - xóa công thức (admin)
router.delete('/recipes/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID công thức không hợp lệ.' });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức.' });
    }

    // Xóa tất cả comments và likes liên quan
    await CommentModel.deleteMany({
      targetType: 'recipe',
      targetId: id,
    });

    await LikeModel.deleteMany({
      targetType: 'recipe',
      targetId: id,
    });

    // Xóa công thức
    await recipe.deleteOne();

    return res.json({
      message: 'Đã xóa công thức thành công.',
    });
  } catch (err) {
    console.error('Error in DELETE /api/admin/recipes/:id', err);
    return res.status(500).json({ message: 'Lỗi server khi xóa công thức.' });
  }
});

export const adminRouter = router;

