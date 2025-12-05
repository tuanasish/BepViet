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
    // Rating fields
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        userId: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        value: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Views fields
    viewsCount: {
      type: Number,
      default: 0,
    },
    viewedByUserIds: {
      type: [Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ relatedRecipeId: 1 });
postSchema.index({ 'ratings.userId': 1 });

export type PostModelType = InferSchemaType<typeof postSchema>;

export const PostModel = model<PostModelType>('Post', postSchema);


