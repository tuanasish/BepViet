import { Schema, Types, model, InferSchemaType } from 'mongoose';

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: String,
    note: String,
  },
  { _id: false }
);

const stepSchema = new Schema(
  {
    order: { type: Number, required: true },
    title: String,
    content: { type: String, required: true },
    imageUrl: String,
  },
  { _id: false }
);

const statsSchema = new Schema(
  {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    authorId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    images: {
      type: [String],
      default: [],
    },
    cookingTimeMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    servings: Number,
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [ingredientSchema],
      default: [],
    },
    steps: {
      type: [stepSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected'],
      default: 'draft',
    },
    stats: {
      type: statsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ slug: 1 }, { unique: true });
recipeSchema.index({ authorId: 1, createdAt: -1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ status: 1, createdAt: -1 });
recipeSchema.index(
  { title: 'text', description: 'text', 'ingredients.name': 'text' },
  { name: 'RecipeTextIndex' }
);

export type RecipeModelType = InferSchemaType<typeof recipeSchema>;

export const RecipeModel = model<RecipeModelType>('Recipe', recipeSchema);


