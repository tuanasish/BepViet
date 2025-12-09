import express from 'express';
import { Types } from 'mongoose';
import { PostModel } from '../models/post.model';
import { RecipeModel } from '../models/recipe.model';
import { LikeModel } from '../models/like.model';
import { CommentModel } from '../models/comment.model';
import { UserModel } from '../models/user.model';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { validateAndCleanText } from '../utils/badwords';

const router = express.Router();

// GET /api/posts - danh sách bài viết mới nhất cho feed (có phân trang)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(
      parseInt((req.query.page as string) || '1', 10) || 1,
      1
    );
    const limit = 5; // mỗi trang 5 bài viết
    const skip = (page - 1) * limit;

    const sortParam = (req.query.sort as string) || 'latest';
    const sortOption =
      sortParam === 'likes'
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [total, posts] = await Promise.all([
      PostModel.countDocuments(),
      PostModel.find()
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name avatarUrl')
        .populate('relatedRecipeId', 'title slug images cookingTimeMinutes difficulty')
        .lean(),
    ]);

    const result = posts.map((p: any) => {
      const ratingCount = p.ratingCount || 0;
      const ratingSum = p.ratingSum || 0;
      const averageRating =
        ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0;

      return {
        id: p._id,
        authorName: p.authorId?.name || 'Ẩn danh',
        authorAvatarUrl: p.authorId?.avatarUrl || null,
        content: p.content,
        imageUrls: p.imageUrls || [],
        likesCount: p.likesCount || 0,
        commentsCount: p.commentsCount || 0,
        createdAt: p.createdAt,
        ratingCount,
        averageRating,
        viewsCount: p.viewsCount || 0,
        relatedRecipe: p.relatedRecipeId
          ? {
              id: p.relatedRecipeId._id,
              title: p.relatedRecipeId.title,
              slug: p.relatedRecipeId.slug,
              image: p.relatedRecipeId.images?.[0] || null,
              timeMinutes: p.relatedRecipeId.cookingTimeMinutes,
              difficulty: p.relatedRecipeId.difficulty,
            }
          : null,
      };
    });

    return res.json({
      posts: result,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      total,
    });
  } catch (err) {
    console.error('Error in GET /api/posts', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách bài viết.' });
  }
});

// GET /api/posts/:id - chi tiết một bài viết
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
    }

    const post = await PostModel.findById(id)
      .populate('authorId', 'name avatarUrl')
      .populate('relatedRecipeId', 'title slug images cookingTimeMinutes difficulty')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    const ratingCount = (post as any).ratingCount || 0;
    const ratingSum = (post as any).ratingSum || 0;
    const averageRating =
      ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0;

    const result: any = {
      id: post._id,
      authorName: (post as any).authorId?.name || 'Ẩn danh',
      authorAvatarUrl: (post as any).authorId?.avatarUrl || null,
      content: post.content,
      imageUrls: post.imageUrls || [],
      likesCount: (post as any).likesCount || 0,
      commentsCount: (post as any).commentsCount || 0,
      createdAt: post.createdAt,
      ratingCount,
      averageRating,
      viewsCount: (post as any).viewsCount || 0,
      relatedRecipe: (post as any).relatedRecipeId
        ? {
            id: (post as any).relatedRecipeId._id,
            title: (post as any).relatedRecipeId.title,
            slug: (post as any).relatedRecipeId.slug,
            image: (post as any).relatedRecipeId.images?.[0] || null,
            timeMinutes: (post as any).relatedRecipeId.cookingTimeMinutes,
            difficulty: (post as any).relatedRecipeId.difficulty,
          }
        : null,
    };

    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/posts/:id', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy chi tiết bài viết.' });
  }
});

// POST /api/posts - tạo bài viết mới
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { content, imageUrls, relatedRecipeId } = req.body as {
      content?: string;
      imageUrls?: string[];
      relatedRecipeId?: string;
    };

    // Kiểm tra quyền đăng bài
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    if (user.canPost === false) {
      return res.status(403).json({ message: 'Bạn đã bị cấm đăng bài. Vui lòng liên hệ quản trị viên.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung bài viết không được để trống.' });
    }

    // Validate và làm sạch nội dung
    let cleanedContent: string;
    try {
      cleanedContent = validateAndCleanText(content.trim(), 'Nội dung bài viết', {
        throwError: true,
        clean: false,
      });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }

    // Validate relatedRecipeId nếu có
    let resolvedRelatedRecipeId: Types.ObjectId | undefined;
    if (relatedRecipeId) {
      if (!Types.ObjectId.isValid(relatedRecipeId)) {
        return res
          .status(400)
          .json({ message: 'ID công thức không hợp lệ.' });
      }

      const recipe = await RecipeModel.findById(relatedRecipeId).lean();
      if (!recipe) {
        return res
          .status(404)
          .json({ message: 'Không tìm thấy công thức để gắn.' });
      }

      // Chỉ cho phép gắn công thức đã publish hoặc công thức của chính user
      if (
        recipe.status !== 'published' &&
        recipe.authorId?.toString() !== userId
      ) {
        return res.status(403).json({
          message:
            'Bạn chỉ có thể gắn công thức đã duyệt hoặc công thức của chính bạn.',
        });
      }

      resolvedRelatedRecipeId = recipe._id as Types.ObjectId;
    }

    const post = await PostModel.create({
      authorId: userId,
      content: cleanedContent,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      relatedRecipeId: resolvedRelatedRecipeId,
    });

    // Populate authorId để lấy thông tin author
    const populatedPost = await PostModel.findById(post._id)
      .populate('authorId', 'name avatarUrl')
      .populate('relatedRecipeId', 'title slug images cookingTimeMinutes difficulty')
      .lean();

    return res.status(201).json({
      id: post._id,
      authorName: (populatedPost as any)?.authorId?.name || 'Ẩn danh',
      authorAvatarUrl: (populatedPost as any)?.authorId?.avatarUrl || null,
      content: post.content,
      imageUrls: post.imageUrls,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt,
      relatedRecipe: (populatedPost as any)?.relatedRecipeId
        ? {
            id: (populatedPost as any).relatedRecipeId._id,
            title: (populatedPost as any).relatedRecipeId.title,
            slug: (populatedPost as any).relatedRecipeId.slug,
            image:
              (populatedPost as any).relatedRecipeId.images?.[0] || null,
            timeMinutes:
              (populatedPost as any).relatedRecipeId.cookingTimeMinutes,
            difficulty: (populatedPost as any).relatedRecipeId.difficulty,
          }
        : null,
    });
  } catch (err) {
    console.error('Error in POST /api/posts', err);
    return res.status(500).json({ message: 'Lỗi server khi tạo bài viết.' });
  }
});

// POST /api/posts/:id/rating - đánh giá bài viết (1-5 sao)
router.post(
  '/:id/rating',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { value } = req.body as { value?: number };

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
      }

      const ratingValue = Number(value);
      if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
        return res
          .status(400)
          .json({ message: 'Giá trị đánh giá phải từ 1 đến 5.' });
      }

      const post = await PostModel.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
      }

      // Tìm rating hiện tại của user
      const existingIndex = (post as any).ratings.findIndex(
        (r: any) => r.userId.toString() === userId
      );

      if (existingIndex >= 0) {
        const existing = (post as any).ratings[existingIndex];
        // Điều chỉnh ratingSum
        (post as any).ratingSum =
          (post as any).ratingSum - existing.value + ratingValue;
        (post as any).ratings[existingIndex].value = ratingValue;
        (post as any).ratings[existingIndex].createdAt = new Date();
      } else {
        // Thêm rating mới
        (post as any).ratings.push({
          userId,
          value: ratingValue,
          createdAt: new Date(),
        });
        (post as any).ratingCount = ((post as any).ratingCount || 0) + 1;
        (post as any).ratingSum =
          ((post as any).ratingSum || 0) + ratingValue;
      }

      await post.save();

      const ratingCount = (post as any).ratingCount || 0;
      const ratingSum = (post as any).ratingSum || 0;
      const averageRating =
        ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0;

      return res.json({
        ratingCount,
        averageRating,
      });
    } catch (err) {
      console.error('Error in POST /api/posts/:id/rating', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi đánh giá bài viết.' });
    }
  }
);

// POST /api/posts/:id/like - thích bài viết
router.post(
  '/:id/like',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
      }

      // Nếu đã like rồi thì không tăng bộ đếm nữa (idempotent)
      const existing = await LikeModel.findOne({
        userId,
        targetType: 'post',
        targetId: id,
      });
      if (existing) {
        return res.json({ message: 'Đã thích bài viết trước đó.' });
      }

      await LikeModel.create({
        userId,
        targetType: 'post',
        targetId: id,
      });

      // Cập nhật bộ đếm like
      await PostModel.updateOne({ _id: id }, { $inc: { likesCount: 1 } });

      return res.status(201).json({ message: 'Đã thích bài viết.' });
    } catch (err) {
      console.error('Error in POST /api/posts/:id/like', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi thích bài viết.' });
    }
  }
);

// POST /api/posts/:id/view - ghi nhận lượt xem (mỗi user chỉ tính 1 lần)
router.post(
  '/:id/view',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
      }

      const post = await PostModel.findById(id);
      if (!post) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
      }

      const hasViewed = (post as any).viewedByUserIds?.some(
        (v: any) => v.toString() === userId
      );

      if (!hasViewed) {
        (post as any).viewedByUserIds = [
          ...((post as any).viewedByUserIds || []),
          new Types.ObjectId(userId),
        ];
        (post as any).viewsCount = ((post as any).viewsCount || 0) + 1;
        await post.save();
      }

      return res.json({
        viewsCount: (post as any).viewsCount || 0,
      });
    } catch (err) {
      console.error('Error in POST /api/posts/:id/view', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi ghi nhận lượt xem bài viết.' });
    }
  }
);

// DELETE /api/posts/:id/like - bỏ thích bài viết
router.delete('/:id/like', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
    }

    const result = await LikeModel.deleteOne({
      userId,
      targetType: 'post',
      targetId: id,
    });

    if (result.deletedCount) {
      await PostModel.updateOne(
        { _id: id },
        { $inc: { likesCount: -1 } }
      );
    }

    return res.json({ message: 'Đã bỏ thích bài viết.' });
  } catch (err) {
    console.error('Error in DELETE /api/posts/:id/like', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi bỏ thích bài viết.' });
  }
});

// GET /api/posts/:id/comments - danh sách bình luận cho bài viết
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
    }

    const comments = await CommentModel.find({
      targetType: 'post',
      targetId: id,
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'name avatarUrl')
      .lean();

    const result = comments.map((c: any) => ({
      id: c._id,
      userId: c.userId?._id?.toString() || '',
      userName: c.userId?.name || 'Ẩn danh',
      userAvatarUrl: c.userId?.avatarUrl || null,
      content: c.content,
      createdAt: c.createdAt,
    }));

    return res.json(result);
  } catch (err) {
    console.error('Error in GET /api/posts/:id/comments', err);
    return res
      .status(500)
      .json({ message: 'Lỗi server khi lấy danh sách bình luận.' });
  }
});

// POST /api/posts/:id/comments - thêm bình luận
router.post(
  '/:id/comments',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { content } = req.body as { content?: string };

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ.' });
      }
      if (!content || !content.trim()) {
        return res
          .status(400)
          .json({ message: 'Nội dung bình luận không được để trống.' });
      }

      // Validate và làm sạch nội dung bình luận
      let cleanedContent: string;
      try {
        cleanedContent = validateAndCleanText(content.trim(), 'Nội dung bình luận', {
          throwError: true,
          clean: false,
        });
      } catch (err: any) {
        return res.status(400).json({ message: err.message });
      }

      const comment = await CommentModel.create({
        userId,
        targetType: 'post',
        targetId: id,
        content: cleanedContent,
      });

      await PostModel.updateOne(
        { _id: id },
        { $inc: { commentsCount: 1 } }
      );

      return res.status(201).json({
        id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
      });
    } catch (err) {
      console.error('Error in POST /api/posts/:id/comments', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi thêm bình luận.' });
    }
  }
);

export const postsRouter = router;


