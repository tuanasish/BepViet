import express from 'express';
import { Types } from 'mongoose';
import { CommentModel } from '../models/comment.model';
import { PostModel } from '../models/post.model';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

const router = express.Router();

// DELETE /api/comments/:id - xoá bình luận (chủ comment hoặc admin)
router.delete(
  '/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID bình luận không hợp lệ.' });
      }

      const comment = await CommentModel.findById(id);
      if (!comment) {
        return res.status(404).json({ message: 'Không tìm thấy bình luận.' });
      }

      const isOwner =
        comment.userId.toString() === user.userId.toString();
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res
          .status(403)
          .json({ message: 'Bạn không có quyền xoá bình luận này.' });
      }

      await comment.deleteOne();

      if (comment.targetType === 'post') {
        await PostModel.updateOne(
          { _id: comment.targetId },
          { $inc: { commentsCount: -1 } }
        );
      }

      return res.json({ message: 'Đã xoá bình luận.' });
    } catch (err) {
      console.error('Error in DELETE /api/comments/:id', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi xoá bình luận.' });
    }
  }
);

export const commentsRouter = router;



