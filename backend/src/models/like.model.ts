import { Schema, Types, model, InferSchemaType } from 'mongoose';

const likeSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'recipe'],
      required: true,
    },
    targetId: {
      type: Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

likeSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);
likeSchema.index({ targetType: 1, targetId: 1 });

export type LikeModelType = InferSchemaType<typeof likeSchema>;

export const LikeModel = model<LikeModelType>('Like', likeSchema);


