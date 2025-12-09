import express from 'express';
import { Types } from 'mongoose';
import { RecipeModel } from '../models/recipe.model';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/recipes/tags - lấy danh sách tag đang dùng trong các công thức
router.get('/tags', async (_req, res) => {
  try {
    const docs = await RecipeModel.aggregate([
      { $match: { status: 'published' } },
      { $project: { tags: 1 } },
      { $unwind: '$tags' },
      { $group: { _id: null, tags: { $addToSet: '$tags' } } },
    ]);

    const tags = docs[0]?.tags || [];

    return res.json({
      tags,
    });
  } catch (err) {
    console.error('Error in GET /api/recipes/tags', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách tags công thức.' });
  }
});

// GET /api/recipes - danh sách công thức (cho trang Explore)
router.get('/', async (req, res) => {
  try {
    const {
      q, // Tìm kiếm text
      category, // Danh mục
      difficulty, // Độ khó: easy, medium, hard
      region, // Vùng miền
      ingredient, // Nguyên liệu
      timeMin, // Thời gian tối thiểu (phút)
      timeMax, // Thời gian tối đa (phút)
      tag, // Tag cụ thể
      limit: limitParam,
      page: pageParam,
    } = req.query as {
      q?: string;
      category?: string;
      difficulty?: string;
      region?: string;
      ingredient?: string;
      timeMin?: string;
      timeMax?: string;
      tag?: string;
      limit?: string;
      page?: string;
    };

    const filter: any = {};

    // Tìm kiếm text - chỉ tìm trong trường tên món (title)
    if (q && q.trim()) {
      filter.title = { $regex: q.trim(), $options: 'i' };
    }

    // Filter theo danh mục
    if (category && category.trim()) {
      filter.category = { $regex: category.trim(), $options: 'i' };
    }

    // Filter theo độ khó
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    // Filter theo vùng miền và tag (tìm trong tags)
    // Nếu region trống hoặc "Mọi miền": không filter theo vùng miền
    const normalizedRegion = region?.trim();
    const normalizedTag = tag?.trim();

    if (normalizedRegion && normalizedRegion !== 'Mọi miền') {
      if (normalizedTag) {
        filter.tags = {
          $all: [new RegExp(normalizedRegion, 'i'), new RegExp(normalizedTag, 'i')],
        };
      } else {
        filter.tags = { $in: [new RegExp(normalizedRegion, 'i')] };
      }
    } else if (normalizedTag) {
      filter.tags = { $in: [new RegExp(normalizedTag, 'i')] };
    }

    // Filter theo nguyên liệu
    if (ingredient && ingredient.trim()) {
      filter['ingredients.name'] = { $regex: ingredient.trim(), $options: 'i' };
    }

    // Filter theo thời gian nấu
    if (timeMin || timeMax) {
      filter.cookingTimeMinutes = {};
      if (timeMin) {
        filter.cookingTimeMinutes.$gte = parseInt(timeMin);
      }
      if (timeMax) {
        filter.cookingTimeMinutes.$lte = parseInt(timeMax);
      }
    }

    // Pagination
    const page = parseInt(pageParam || '1');
    const limit = parseInt(limitParam || '12');
    const skip = (page - 1) * limit;

    // Tìm kiếm và sắp xếp kết quả
    const recipes = await RecipeModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug images cookingTimeMinutes difficulty category tags')
      .lean();

    const total = await RecipeModel.countDocuments(filter);

    const result = recipes.map((r) => ({
      id: r._id,
      title: r.title,
      slug: r.slug,
      image: r.images?.[0] || null,
      timeMinutes: r.cookingTimeMinutes,
      difficulty: r.difficulty,
      category: r.category,
      tags: r.tags,
    }));

    return res.json({
      recipes: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error in GET /api/recipes', err);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách công thức.' });
  }
});

// POST /api/recipes/:id/rating - đánh giá công thức (1-5 sao)
router.post(
  '/:id/rating',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { value } = req.body as { value?: number };

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID công thức không hợp lệ.' });
      }

      const ratingValue = Number(value);
      if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
        return res
          .status(400)
          .json({ message: 'Giá trị đánh giá phải từ 1 đến 5.' });
      }

      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Không tìm thấy công thức.' });
      }

      // Tìm rating hiện tại của user
      const existingIndex = (recipe as any).ratings.findIndex(
        (r: any) => r.userId.toString() === userId
      );

      if (existingIndex >= 0) {
        const existing = (recipe as any).ratings[existingIndex];
        // Điều chỉnh ratingSum
        (recipe as any).ratingSum =
          (recipe as any).ratingSum - existing.value + ratingValue;
        (recipe as any).ratings[existingIndex].value = ratingValue;
        (recipe as any).ratings[existingIndex].createdAt = new Date();
      } else {
        // Thêm rating mới
        (recipe as any).ratings.push({
          userId,
          value: ratingValue,
          createdAt: new Date(),
        });
        (recipe as any).ratingCount = ((recipe as any).ratingCount || 0) + 1;
        (recipe as any).ratingSum =
          ((recipe as any).ratingSum || 0) + ratingValue;
      }

      await recipe.save();

      const ratingCount = (recipe as any).ratingCount || 0;
      const ratingSum = (recipe as any).ratingSum || 0;
      const averageRating =
        ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0;

      return res.json({
        ratingCount,
        averageRating,
      });
    } catch (err) {
      console.error('Error in POST /api/recipes/:id/rating', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi đánh giá công thức.' });
    }
  }
);

// GET /api/recipes/:slug - chi tiết công thức
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const recipe = await RecipeModel.findOne({
      slug,
      status: 'published',
    })
      .populate('authorId', 'name')
      .lean();

    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức.' });
    }

    const ratingCount = (recipe as any).ratingCount || 0;
    const ratingSum = (recipe as any).ratingSum || 0;
    const averageRating =
      ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0;

    return res.json({
      id: recipe._id,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      images: recipe.images,
      timeMinutes: recipe.cookingTimeMinutes,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      category: recipe.category,
      tags: recipe.tags,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      authorName:
        (recipe as any).authorId && (recipe as any).authorId.name
          ? (recipe as any).authorId.name
          : 'Ẩn danh',
      ratingCount,
      averageRating,
    });
  } catch (err) {
    console.error('Error in GET /api/recipes/:slug', err);
    return res.status(500).json({ message: 'Lỗi server khi lấy chi tiết công thức.' });
  }
});

export const recipesRouter = router;

