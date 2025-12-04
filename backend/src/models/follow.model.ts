import { Schema, Types, model, InferSchemaType } from 'mongoose';

const followSchema = new Schema(
  {
    followerId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followingId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

followSchema.index(
  { followerId: 1, followingId: 1 },
  { unique: true }
);
followSchema.index({ followingId: 1 });

export type FollowModelType = InferSchemaType<typeof followSchema>;

export const FollowModel = model<FollowModelType>('Follow', followSchema);


