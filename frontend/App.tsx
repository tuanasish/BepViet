import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FeedPage from './pages/user/FeedPage';
import CollectionPage from './pages/user/CollectionPage';
import SearchPage from './pages/user/SearchPage';
import RecipeDetailPage from './pages/user/RecipeDetailPage';
import ProfilePage from './pages/user/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRecipePage from './pages/admin/AdminRecipePage';
import AdminRecipeEditPage from './pages/admin/AdminRecipeEditPage';
import AdminRecipeCreatePage from './pages/admin/AdminRecipeCreatePage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminPostPage from './pages/admin/AdminPostPage';
import ChatbotButton from './components/ChatbotButton';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Routes */}
        <Route path="/" element={<FeedPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/recipes" element={<AdminRecipePage />} />
        <Route path="/admin/recipes/new" element={<AdminRecipeCreatePage />} />
        <Route path="/admin/recipes/:id/edit" element={<AdminRecipeEditPage />} />
        <Route path="/admin/users" element={<AdminUserPage />} />
        <Route path="/admin/posts" element={<AdminPostPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Chatbot Button - hiển thị trên tất cả trang trừ admin */}
      <ChatbotButton />
    </HashRouter>
  );
};

export default App;


