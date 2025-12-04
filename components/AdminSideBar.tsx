import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChefHatLogo from './ChefHatLogo';

const AdminSideBar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside class="hidden md:flex w-64 flex-col border-r border-border-light dark:border-border-dark bg-white dark:bg-background-dark p-4 h-screen sticky top-0">
      <div class="flex h-full flex-col justify-between">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3 px-3 py-2">
            <div class="size-10 text-primary flex items-center justify-center rounded-full bg-background-light dark:bg-background-dark">
              <ChefHatLogo className="w-7 h-7" />
            </div>
            <div class="flex flex-col">
              <h1 class="text-text-light dark:text-text-dark text-base font-bold leading-normal">BepViet</h1>
              <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Admin Panel</p>
            </div>
          </div>
          <nav class="flex flex-col gap-2 mt-4">
            <Link to="/admin/dashboard" class={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/dashboard') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <span class={`material-symbols-outlined ${isActive('/admin/dashboard') ? 'fill' : ''}`}>dashboard</span>
              <p class="text-sm font-medium leading-normal">Dashboard</p>
            </Link>
            <Link to="/admin/recipes" class={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/recipes') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <span class={`material-symbols-outlined ${isActive('/admin/recipes') ? 'fill' : ''}`}>menu_book</span>
              <p class="text-sm font-medium leading-normal">Quản lý công thức</p>
            </Link>
            <Link to="/admin/users" class={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/users') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <span class={`material-symbols-outlined ${isActive('/admin/users') ? 'fill' : ''}`}>group</span>
              <p class="text-sm font-medium leading-normal">Quản lý người dùng</p>
            </Link>
          </nav>
        </div>
        <div class="flex flex-col gap-1">
            <Link to="/feed" class="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5">
                <span class="material-symbols-outlined">home</span>
                <p class="text-sm font-medium leading-normal">Về trang chủ</p>
            </Link>
          <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer">
            <span class="material-symbols-outlined">logout</span>
            <p class="text-sm font-medium leading-normal">Logout</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSideBar;
