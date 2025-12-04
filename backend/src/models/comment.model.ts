import { Schema, Types, model, InferSchemaType } from 'mongoose';

const commentSchema = new Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentCommentId: {
      type: Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });
commentSchema.index({ parentCommentId: 1 });

export type CommentModelType = InferSchemaType<typeof commentSchema>;

export const CommentModel = model<CommentModelType>('Comment', commentSchema);


