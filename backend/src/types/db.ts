import { ObjectId } from 'mongodb';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface UserDoc {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RecipeIngredient {
  name: string;
  amount?: string;
  note?: string;
}

export interface RecipeStep {
  order: number;
  title?: string;
  content: string;
  imageUrl?: string;
}

export type RecipeStatus = 'draft' | 'pending_review' | 'published' | 'rejected';

export interface RecipeStats {
  views: number;
  likes: number;
  bookmarks: number;
}

export interface RecipeDoc {
  _id: ObjectId;
  authorId: ObjectId;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  cookingTimeMinutes: number;
  difficulty: Difficulty;
  servings?: number;
  category: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  status: RecipeStatus;
  stats: RecipeStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDoc {
  _id: ObjectId;
  authorId: ObjectId;
  content: string;
  imageUrls: string[];
  relatedRecipeId?: ObjectId;
  likesCount: number;
  commentsCount: number;
  ratingCount: number;
  ratingSum: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentTargetType = 'post' | 'recipe';

export interface CommentDoc {
  _id: ObjectId;
  userId: ObjectId;
  targetType: CommentTargetType;
  targetId: ObjectId;
  content: string;
  parentCommentId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type LikeTargetType = 'post' | 'recipe';

export interface LikeDoc {
  _id: ObjectId;
  userId: ObjectId;
  targetType: LikeTargetType;
  targetId: ObjectId;
  createdAt: Date;
}

export interface CollectionDoc {
  _id: ObjectId;
  userId: ObjectId;
  recipeId: ObjectId;
  createdAt: Date;
}

export interface FollowDoc {
  _id: ObjectId;
  followerId: ObjectId;
  followingId: ObjectId;
  createdAt: Date;
}

export type AdminLogTargetType = 'user' | 'recipe' | 'post';

export interface AdminLogDoc {
  _id: ObjectId;
  adminId: ObjectId;
  action: string;
  targetType: AdminLogTargetType;
  targetId?: ObjectId;
  details?: any;
  createdAt: Date;
}


