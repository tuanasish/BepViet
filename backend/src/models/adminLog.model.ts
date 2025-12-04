import { Schema, Types, model, InferSchemaType } from 'mongoose';

const adminLogSchema = new Schema(
  {
    adminId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'recipe', 'post'],
      required: true,
    },
    targetId: {
      type: Types.ObjectId,
    },
    details: Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export type AdminLogModelType = InferSchemaType<typeof adminLogSchema>;

export const AdminLogModel = model<AdminLogModelType>(
  'AdminLog',
  adminLogSchema
);


