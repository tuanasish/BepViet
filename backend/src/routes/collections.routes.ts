import express from 'express';
import { Types } from 'mongoose';
import { CollectionModel } from '../models/collection.model';
import { RecipeModel } from '../models/recipe.model';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/collections - lưu công thức
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { recipeId } = req.body as { recipeId?: string };

    if (!recipeId || !Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'recipeId không hợp lệ.' });
    }

    await CollectionModel.updateOne(
      { userId, recipeId },
      { $setOnInsert: { userId, recipeId } },
      { upsert: true }
    );

    return res.status(201).json({ message: 'Đã lưu công thức.' });
  } catch (err) {
    console.error('Error in POST /api/collections', err);
    return res.status(500).json({ message: 'Lỗi server khi lưu công thức.' });
  }
});

// DELETE /api/collections/:recipeId - bỏ lưu công thức
router.delete('/:recipeId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { recipeId } = req.params;

    if (!recipeId || !Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ message: 'recipeId không hợp lệ.' });
    }

    await CollectionModel.deleteOne({
      userId,
      recipeId,
    });

    return res.json({ message: 'Đã bỏ lưu công thức.' });
  } catch (err) {
    console.error('Error in DELETE /api/collections/:recipeId', err);
    return res.status(500).json({ message: 'Lỗi server khi bỏ lưu công thức.' });
  }
});

// GET /api/collections/me - danh sách công thức đã lưu của user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    const collections = await CollectionModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate('recipeId')
      .lean();

    const result = collections
      .map((c: any) => {
        const r = c.recipeId as any;
        if (!r) return null;
        return {
          id: r._id,
          title: r.title,
          slug: r.slug,
          image: r.images?.[0] || null,
          timeMinutes: r.cookingTimeMinutes,
          difficulty: r.difficulty,
          category: r.category,
          tags: r.tags,
        };
      })
      .filter(Boolean);

    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/collections/me', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách công thức đã lưu.' });
  }
});

export const collectionsRouter = router;


