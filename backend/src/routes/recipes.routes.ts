import express from 'express';
import { RecipeModel } from '../models/recipe.model';

const router = express.Router();

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

    const filter: any = { status: 'published' };

    // Tìm kiếm text (tên, mô tả, nguyên liệu)
    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } },
        { 'ingredients.name': { $regex: q.trim(), $options: 'i' } },
      ];
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
    // Nếu có cả region và tag, tìm recipes có CẢ HAI tags
    if (region && region.trim() && tag && tag.trim()) {
      filter.tags = {
        $all: [new RegExp(region.trim(), 'i'), new RegExp(tag.trim(), 'i')],
      };
    } else if (region && region.trim()) {
      filter.tags = { $in: [new RegExp(region.trim(), 'i')] };
    } else if (tag && tag.trim()) {
      filter.tags = { $in: [new RegExp(tag.trim(), 'i')] };
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
    const limit = parseInt(limitParam || '50');
    const skip = (page - 1) * limit;

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
    });
  } catch (err) {
    console.error('Error in GET /api/recipes/:slug', err);
    return res.status(500).json({ message: 'Lỗi server khi lấy chi tiết công thức.' });
  }
});

export const recipesRouter = router;

