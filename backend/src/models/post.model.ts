import { Schema, Types, model, InferSchemaType } from 'mongoose';

const postSchema = new Schema(
  {
    authorId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    relatedRecipeId: {
      type: Types.ObjectId,
      ref: 'Recipe',
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ relatedRecipeId: 1 });

export type PostModelType = InferSchemaType<typeof postSchema>;

export const PostModel = model<PostModelType>('Post', postSchema);


