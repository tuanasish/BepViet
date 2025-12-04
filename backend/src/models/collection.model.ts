import { Schema, Types, model, InferSchemaType } from 'mongoose';

const collectionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipeId: {
      type: Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

collectionSchema.index(
  { userId: 1, recipeId: 1 },
  { unique: true }
);
collectionSchema.index({ userId: 1, createdAt: -1 });

export type CollectionModelType = InferSchemaType<typeof collectionSchema>;

export const CollectionModel = model<CollectionModelType>(
  'Collection',
  collectionSchema
);


