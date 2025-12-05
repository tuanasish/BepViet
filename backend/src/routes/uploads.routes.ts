import express from 'express';
import multer from 'multer';
import { cloudinary } from '../utils/cloudinary';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// POST /api/uploads/image - upload 1 ảnh lên Cloudinary, trả về URL
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Không có file ảnh được gửi lên.' });
      }

      if (!cloudinary.config().cloud_name) {
        return res
          .status(500)
          .json({ message: 'Cloudinary chưa được cấu hình trên server.' });
      }

      const buffer = req.file.buffer;

      const uploadResult = await new Promise<{
        secure_url: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'bepviet/posts',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload failed'));
            }
            resolve({ secure_url: result.secure_url });
          }
        );

        stream.end(buffer);
      });

      return res.status(201).json({
        url: uploadResult.secure_url,
      });
    } catch (err) {
      console.error('Error in POST /api/uploads/image', err);
      return res
        .status(500)
        .json({ message: 'Lỗi server khi upload ảnh, vui lòng thử lại.' });
    }
  }
);

export const uploadsRouter = router;






