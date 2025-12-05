const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatarUrl?: string;
  };
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Đăng nhập thất bại');
  }

  const data = (await res.json()) as AuthResponse;
  return data;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string
) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Đăng ký thất bại');
  }

  const data = (await res.json()) as AuthResponse;
  return data;
}

export function saveAuthToStorage(auth: AuthResponse) {
  localStorage.setItem('bepviet_token', auth.token);
  localStorage.setItem('bepviet_user', JSON.stringify(auth.user));
}

export interface RecipeListItem {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  timeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
}

export interface RecipeFilters {
  q?: string; // Tìm kiếm text
  category?: string; // Danh mục
  difficulty?: 'easy' | 'medium' | 'hard'; // Độ khó
  region?: string; // Vùng miền
  ingredient?: string; // Nguyên liệu
  timeMin?: number; // Thời gian tối thiểu (phút)
  timeMax?: number; // Thời gian tối đa (phút)
  tag?: string; // Tag cụ thể
  page?: number;
  limit?: number;
}

export interface RecipesResponse {
  recipes: RecipeListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function apiGetRecipes(filters?: RecipeFilters): Promise<RecipesResponse> {
  const url = new URL('/api/recipes', API_BASE);
  
  if (filters) {
    if (filters.q && filters.q.trim()) {
      url.searchParams.set('q', filters.q.trim());
    }
    if (filters.category) {
      url.searchParams.set('category', filters.category);
    }
    if (filters.difficulty) {
      url.searchParams.set('difficulty', filters.difficulty);
    }
    if (filters.region) {
      url.searchParams.set('region', filters.region);
    }
    if (filters.ingredient) {
      url.searchParams.set('ingredient', filters.ingredient);
    }
    if (filters.timeMin !== undefined) {
      url.searchParams.set('timeMin', filters.timeMin.toString());
    }
    if (filters.timeMax !== undefined) {
      url.searchParams.set('timeMax', filters.timeMax.toString());
    }
    if (filters.tag) {
      url.searchParams.set('tag', filters.tag);
    }
    if (filters.page) {
      url.searchParams.set('page', filters.page.toString());
    }
    if (filters.limit) {
      url.searchParams.set('limit', filters.limit.toString());
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('Không lấy được danh sách công thức');
  }
  return (await res.json()) as RecipesResponse;
}

// Tags công thức
export interface RecipeTagsResponse {
  tags: string[];
}

export async function apiGetRecipeTags(): Promise<RecipeTagsResponse> {
  const res = await fetch(`${API_BASE}/api/recipes/tags`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được danh sách tag công thức');
  }
  return (await res.json()) as RecipeTagsResponse;
}

// Công thức của user (để gắn vào bài viết)
export interface UserRecipeSummary {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  timeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  status: string;
}

export async function apiGetMyRecipesForAttach(
  status?: string
): Promise<UserRecipeSummary[]> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để lấy công thức của bạn');
  }
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const res = await fetch(
    `${API_BASE}/api/users/me/recipes${params.toString() ? `?${params.toString()}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được danh sách công thức của bạn');
  }
  return (await res.json()) as UserRecipeSummary[];
}

export interface CreateMyRecipePayload {
  title: string;
  description?: string;
  images?: string[];
  cookingTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings?: number;
  category: string;
  tags?: string[];
  ingredients?: Array<{ name: string; amount?: string; note?: string }>;
  steps: Array<{ order?: number; title?: string; content: string; imageUrl?: string }>;
}

export async function apiCreateMyRecipe(
  payload: CreateMyRecipePayload
): Promise<{
  id: string;
  title: string;
  slug: string;
  images: string[];
  cookingTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  status: string;
}> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để tạo công thức');
  }
  const res = await fetch(`${API_BASE}/api/users/me/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không tạo được công thức');
  }
  return (await res.json()) as {
    id: string;
    title: string;
    slug: string;
    images: string[];
    cookingTimeMinutes: number;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    tags: string[];
    status: string;
  };
}

export interface RecipeDetail {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  timeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings?: number;
  category: string;
  tags: string[];
  ingredients: { name: string; amount?: string; note?: string }[];
  steps: { order: number; title?: string; content: string; imageUrl?: string }[];
  authorName: string;
}

export async function apiGetRecipeDetail(
  slug: string
): Promise<RecipeDetail> {
  const res = await fetch(`${API_BASE}/api/recipes/${slug}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được chi tiết công thức');
  }
  return (await res.json()) as RecipeDetail;
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bepviet_token');
}

export async function apiSaveRecipe(recipeId: string) {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để lưu công thức');
  }
  const res = await fetch(`${API_BASE}/api/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipeId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể lưu công thức');
  }
}

export async function apiUnsaveRecipe(recipeId: string) {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để bỏ lưu công thức');
  }
  const res = await fetch(`${API_BASE}/api/collections/${recipeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể bỏ lưu công thức');
  }
}

export async function apiGetMyCollections(): Promise<RecipeListItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xem bộ sưu tập');
  }
  const res = await fetch(`${API_BASE}/api/collections/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được bộ sưu tập');
  }
  return (await res.json()) as RecipeListItem[];
}

export interface MyPost {
  id: string;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export async function apiGetMyPosts(): Promise<MyPost[]> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xem bài viết của bạn');
  }
  const res = await fetch(`${API_BASE}/api/users/me/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được bài viết của bạn');
  }
  return (await res.json()) as MyPost[];
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl?: string;
  stats: {
    totalRecipes: number;
    totalCollections: number;
    totalPosts: number;
  };
}

export async function apiGetUserSummary(): Promise<UserSummary> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xem trang hồ sơ');
  }
  const res = await fetch(`${API_BASE}/api/users/me/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được thông tin người dùng');
  }
  return (await res.json()) as UserSummary;
}

export async function apiUpdateAvatar(
  avatarUrl: string
): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatarUrl?: string;
}> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để cập nhật ảnh đại diện');
  }
  const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ avatarUrl }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không cập nhật được ảnh đại diện');
  }
  return (await res.json()) as {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatarUrl?: string;
  };
}

export async function apiUpdateProfile(data: {
  name?: string;
  email?: string;
}): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatarUrl?: string;
}> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để cập nhật thông tin');
  }
  const res = await fetch(`${API_BASE}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Không cập nhật được thông tin');
  }
  return (await res.json()) as {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatarUrl?: string;
  };
}

export async function apiChangePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để đổi mật khẩu');
  }
  const res = await fetch(`${API_BASE}/api/users/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Không đổi được mật khẩu');
  }
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  ratingCount?: number;
  averageRating?: number;
  viewsCount?: number;
  relatedRecipe?: {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    timeMinutes: number;
    difficulty: 'easy' | 'medium' | 'hard';
  } | null;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

export type FeedSort = 'latest' | 'likes';

export interface FeedResponse {
  posts: FeedPost[];
  page: number;
  totalPages: number;
  total: number;
}

export async function apiGetFeed(
  page: number = 1,
  sort: FeedSort = 'latest'
): Promise<FeedResponse> {
  const params = new URLSearchParams();
  if (page && page > 1) params.set('page', page.toString());
  if (sort && sort !== 'latest') params.set('sort', sort);

  const res = await fetch(
    `${API_BASE}/api/posts${params.toString() ? `?${params.toString()}` : ''}`
  );
  if (!res.ok) {
    throw new Error('Không tải được feed');
  }
  return (await res.json()) as FeedResponse;
}

export async function apiGetPostById(postId: string): Promise<FeedPost> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không tải được bài viết');
  }
  return (await res.json()) as FeedPost;
}

export async function apiCreatePost(
  content: string,
  imageUrl?: string,
  relatedRecipeId?: string
): Promise<FeedPost> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để đăng bài');
  }
  const body: any = { content };
  if (imageUrl) {
    body.imageUrls = [imageUrl];
  }
  if (relatedRecipeId) {
    body.relatedRecipeId = relatedRecipeId;
  }
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không đăng được bài');
  }
  return (await res.json()) as FeedPost;
}

export async function apiUploadImage(file: File): Promise<string> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để upload ảnh');
  }

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/api/uploads/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Upload ảnh thất bại');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function apiLikePost(postId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để thích bài viết');
  }
  const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể thích bài viết');
  }
}

export async function apiUnlikePost(postId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để bỏ thích bài viết');
  }
  const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể bỏ thích bài viết');
  }
}

export async function apiCommentPost(
  postId: string,
  content: string
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để bình luận');
  }
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể bình luận');
  }
}

export async function apiGetPostComments(
  postId: string
): Promise<PostComment[]> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể tải bình luận');
  }
  return (await res.json()) as PostComment[];
}

export async function apiRatePost(
  postId: string,
  value: number
): Promise<{ ratingCount: number; averageRating: number }> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để đánh giá bài viết');
  }
  const res = await fetch(`${API_BASE}/api/posts/${postId}/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể đánh giá bài viết');
  }
  return (await res.json()) as { ratingCount: number; averageRating: number };
}

export async function apiViewPost(
  postId: string
): Promise<{ viewsCount: number }> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xem bài viết');
  }
  const res = await fetch(`${API_BASE}/api/posts/${postId}/view`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể ghi nhận lượt xem');
  }
  return (await res.json()) as { viewsCount: number };
}

export async function apiDeleteComment(commentId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xoá bình luận');
  }
  const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể xoá bình luận');
  }
}

// ========== Admin API Functions ==========

export interface AdminOverview {
  totalUsers: number;
  totalRecipes: number;
  totalPosts: number;
  pendingRecipes: number;
  postsToday: number;
  recipesToday: number;
  usersToday: number;
}

export async function apiGetAdminOverview(): Promise<AdminOverview> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể lấy thống kê tổng quan');
  }
  return (await res.json()) as AdminOverview;
}

export interface AdminRecipe {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  cookingTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  status?: string;
  authorName: string;
  authorEmail?: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
}

export interface AdminRecipesResponse {
  recipes: AdminRecipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function apiGetAdminRecipes(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
): Promise<AdminRecipesResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.set('status', status);
  if (search) params.set('search', search);

  const res = await fetch(`${API_BASE}/api/admin/recipes?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể lấy danh sách công thức');
  }
  return (await res.json()) as AdminRecipesResponse;
}

export async function apiGetPendingRecipes(
  page: number = 1,
  limit: number = 20
): Promise<AdminRecipesResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await fetch(`${API_BASE}/api/admin/recipes/pending?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể lấy danh sách công thức chờ duyệt');
  }
  return (await res.json()) as AdminRecipesResponse;
}

export async function apiGetAdminRecipeDetail(recipeId: string): Promise<RecipeDetail> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/recipes/${recipeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không lấy được chi tiết công thức');
  }
  const data = await res.json();
  // Convert admin recipe format to RecipeDetail format
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    images: data.images || [],
    timeMinutes: data.cookingTimeMinutes,
    difficulty: data.difficulty,
    servings: data.servings,
    category: data.category,
    tags: data.tags || [],
    ingredients: data.ingredients || [],
    steps: data.steps || [],
    authorName: data.authorName,
  };
}

export interface AdminRecipeUpdateData {
  title?: string;
  description?: string;
  images?: string[];
  cookingTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  category?: string;
  tags?: string[];
  ingredients?: Array<{ name: string; amount?: string; note?: string }>;
  steps?: Array<{ order: number; title?: string; content: string; imageUrl?: string }>;
  status?: 'draft' | 'pending_review' | 'published' | 'rejected';
}

export async function apiCreateAdminRecipe(
  data: AdminRecipeUpdateData
): Promise<{ message: string; recipe: any }> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Không thể tạo công thức');
  }
  return (await res.json()) as { message: string; recipe: any };
}

export async function apiUpdateAdminRecipe(
  recipeId: string,
  data: AdminRecipeUpdateData
): Promise<{ message: string; recipe: any }> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/recipes/${recipeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Không thể cập nhật công thức');
  }
  return (await res.json()) as { message: string; recipe: any };
}

export async function apiDeleteAdminRecipe(recipeId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể xóa công thức');
  }
}

// Chatbot API
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SuggestedRecipe {
  id: string;
  slug?: string;
  title: string;
  category: string;
  difficulty: string;
  cookingTimeMinutes: number;
}

export interface ChatbotResponse {
  message: string;
  suggestedRecipes: SuggestedRecipe[];
}

export async function apiChatbotChat(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatbotResponse> {
  const res = await fetch(`${API_BASE}/api/chatbot/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationHistory }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể kết nối với chatbot');
  }

  return (await res.json()) as ChatbotResponse;
}

export async function apiApproveRecipe(recipeId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/recipes/${recipeId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể duyệt công thức');
  }
}

export async function apiRejectRecipe(
  recipeId: string,
  reason?: string
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/recipes/${recipeId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể từ chối công thức');
  }
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function apiGetAdminUsers(
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string,
  status?: string
): Promise<AdminUsersResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (status) params.set('status', status);

  const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể lấy danh sách người dùng');
  }
  return (await res.json()) as AdminUsersResponse;
}

export async function apiLockUser(userId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/lock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể khóa tài khoản');
  }
}

export async function apiUnlockUser(userId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/unlock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể mở khóa tài khoản');
  }
}

// Admin Posts API
export interface AdminPost {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorAvatarUrl?: string | null;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface AdminPostsResponse {
  posts: AdminPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function apiGetAdminPosts(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<AdminPostsResponse> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.set('search', search);

  const res = await fetch(`${API_BASE}/api/admin/posts?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể lấy danh sách bài đăng');
  }
  return (await res.json()) as AdminPostsResponse;
}

export async function apiDeleteAdminPost(postId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('Bạn cần đăng nhập để truy cập admin');
  }
  const res = await fetch(`${API_BASE}/api/admin/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || 'Không thể xóa bài đăng');
  }
}


