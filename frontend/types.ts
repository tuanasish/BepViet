export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  difficulty: string;
  author: string;
  authorAvatar: string;
  date: string;
  category: string;
  status?: string; // For admin
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Locked';
  avatar: string;
  joinDate: string;
}

export interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  image?: string;
  relatedRecipe?: Recipe;
  likes: number;
  comments: number;
}


