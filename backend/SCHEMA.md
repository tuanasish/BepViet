## MongoDB Schema v1 cho BepViet

### 1. Collection `users`

- Các field:
  - `_id: ObjectId`
  - `email: string` (unique, lowercase, required)
  - `passwordHash: string` (bcrypt hash)
  - `name: string`
  - `avatarUrl?: string`
  - `bio?: string`
  - `role: 'user' | 'admin'` (default: `user`)
  - `status: 'active' | 'locked'` (default: `active`)
  - `createdAt: Date`
  - `updatedAt: Date`
- Index:
  - `{ email: 1 }` unique
  - `{ status: 1, createdAt: -1 }`

### 2. Collection `recipes`

- Các field:
  - `_id: ObjectId`
  - `authorId: ObjectId` (ref `users._id`)
  - `title: string`
  - `slug: string` (unique, dùng cho URL thân thiện)
  - `description?: string`
  - `images: string[]` (URL ảnh)
  - `cookingTimeMinutes: number`
  - `difficulty: 'easy' | 'medium' | 'hard'`
  - `servings?: number`
  - `category: string` (ví dụ: 'Món chính', 'Khai vị', 'Tráng miệng')
  - `tags: string[]`
  - `ingredients: { name: string; amount?: string; note?: string }[]`
  - `steps: { order: number; title?: string; content: string; imageUrl?: string }[]`
  - `status: 'draft' | 'pending_review' | 'published' | 'rejected'` (default: `draft`)
  - `stats: { views: number; likes: number; bookmarks: number }`
  - `createdAt: Date`
  - `updatedAt: Date`
- Index:
  - `{ slug: 1 }` unique
  - `{ authorId: 1, createdAt: -1 }`
  - `{ category: 1 }`
  - `{ tags: 1 }`
  - `{ status: 1, createdAt: -1 }`
  - Text index: `{ title: 'text', description: 'text', 'ingredients.name': 'text' }`

### 3. Collection `posts` (feed bài đăng người dùng)

- Các field:
  - `_id: ObjectId`
  - `authorId: ObjectId` (ref `users._id`)
  - `content: string`
  - `imageUrls: string[]`
  - `relatedRecipeId?: ObjectId` (ref `recipes._id`)
  - `likesCount: number`
  - `commentsCount: number`
  - `createdAt: Date`
  - `updatedAt: Date`
- Index:
  - `{ authorId: 1, createdAt: -1 }`
  - `{ createdAt: -1 }`
  - `{ relatedRecipeId: 1 }`

### 4. Collection `comments`

- Dùng chung cho cả bài viết và công thức.
- Các field:
  - `_id: ObjectId`
  - `userId: ObjectId` (ref `users._id`)
  - `targetType: 'post' | 'recipe'`
  - `targetId: ObjectId` (ref `posts._id` hoặc `recipes._id`)
  - `content: string`
  - `parentCommentId?: ObjectId` (hỗ trợ reply)
  - `createdAt: Date`
  - `updatedAt: Date`
- Index:
  - `{ targetType: 1, targetId: 1, createdAt: 1 }`
  - `{ parentCommentId: 1 }`

### 5. Collection `likes`

- Các field:
  - `_id: ObjectId`
  - `userId: ObjectId` (ref `users._id`)
  - `targetType: 'post' | 'recipe'`
  - `targetId: ObjectId`
  - `createdAt: Date`
- Index:
  - Unique: `{ userId: 1, targetType: 1, targetId: 1 }`
  - `{ targetType: 1, targetId: 1 }`

### 6. Collection `collections` (công thức đã lưu)

- Các field:
  - `_id: ObjectId`
  - `userId: ObjectId` (ref `users._id`)
  - `recipeId: ObjectId` (ref `recipes._id`)
  - `createdAt: Date`
- Index:
  - Unique: `{ userId: 1, recipeId: 1 }`
  - `{ userId: 1, createdAt: -1 }`

### 7. Collection `follows` (theo dõi người dùng)

- Các field:
  - `_id: ObjectId`
  - `followerId: ObjectId` (ref `users._id`)
  - `followingId: ObjectId` (ref `users._id`)
  - `createdAt: Date`
- Index:
  - Unique: `{ followerId: 1, followingId: 1 }`
  - `{ followingId: 1 }` (lấy danh sách follower)

### 8. Collection `admin_logs` (log thao tác quản trị)

- Các field:
  - `_id: ObjectId`
  - `adminId: ObjectId` (ref `users._id`)
  - `action: string` (ví dụ: 'approve_recipe', 'reject_recipe', 'lock_user')
  - `targetType: 'user' | 'recipe' | 'post'`
  - `targetId?: ObjectId`
  - `details?: any`
  - `createdAt: Date`
- Index:
  - `{ adminId: 1, createdAt: -1 }`
  - `{ targetType: 1, targetId: 1, createdAt: -1 }`


