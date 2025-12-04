import express from 'express';
import { Types } from 'mongoose';
import { PostModel } from '../models/post.model';
import { LikeModel } from '../models/like.model';
import { CommentModel } from '../models/comment.model';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { validateAndCleanText } from '../utils/badwords';

const router = express.Router();

// GET /api/posts - danh sách bài viết mới nhất cho feed
router.get('/', async (_req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('authorId', 'name avatarUrl')
      .lean();

    const result = posts.map((p: any) => ({
      id: p._id,
      authorName: p.authorId?.name || 'Ẩn danh',
      authorAvatarUrl: p.authorId?.avatarUrl || null,
      content: p.content,
      imageUrls: p.imageUrls || [],
      likesCount: p.likesCount || 0,
      commentsCount: p.commentsCount || 0,
      createdAt: p.createdAt,
    }));

    return res.json(result);
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
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    const result: any = {
      id: post._id,
      authorName: (post as any).authorId?.name || 'Ẩn danh',
      authorAvatarUrl: (post as any).authorId?.avatarUrl || null,
      content: post.content,
      imageUrls: post.imageUrls || [],
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: post.createdAt,
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
    const { content, imageUrls } = req.body as {
      content?: string;
      imageUrls?: string[];
    };

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

    const post = await PostModel.create({
      authorId: userId,
      content: cleanedContent,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
    });

    // Populate authorId để lấy thông tin author
    const populatedPost = await PostModel.findById(post._id)
      .populate('authorId', 'name avatarUrl')
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
    });
  } catch (err) {
    console.error('Error in POST /api/posts', err);
    return res.status(500).json({ message: 'Lỗi server khi tạo bài viết.' });
  }
});

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


