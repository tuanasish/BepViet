import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChefHatLogo from './ChefHatLogo';
import { isLoggedIn, isAdmin, logout } from '../auth';

const AdminSideBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const guardAdmin = (path: string) => {
    if (!isLoggedIn()) {
      toast.error('Bạn cần đăng nhập để truy cập trang quản trị');
      navigate('/');
      return;
    }
    if (!isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      return;
    }
    navigate(path);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border-light dark:border-border-dark bg-white dark:bg-background-dark p-4 h-screen sticky top-0">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-10 text-primary flex items-center justify-center rounded-full bg-background-light dark:bg-background-dark">
              <ChefHatLogo className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-text-light dark:text-text-dark text-base font-bold leading-normal">BepViet</h1>
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Admin Panel</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/dashboard') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <span className={`material-symbols-outlined ${isActive('/admin/dashboard') ? 'fill' : ''}`}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </Link>
            <Link
              to="/admin/recipes"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/recipes') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <span className={`material-symbols-outlined ${isActive('/admin/recipes') ? 'fill' : ''}`}>menu_book</span>
              <p className="text-sm font-medium leading-normal">Quản lý công thức</p>
            </Link>
            <Link
              to="/admin/users"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/users') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <span className={`material-symbols-outlined ${isActive('/admin/users') ? 'fill' : ''}`}>group</span>
              <p className="text-sm font-medium leading-normal">Quản lý người dùng</p>
            </Link>
            <Link
              to="/admin/posts"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/posts') ? 'bg-primary/20 text-primary' : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <span className={`material-symbols-outlined ${isActive('/admin/posts') ? 'fill' : ''}`}>article</span>
              <p className="text-sm font-medium leading-normal">Quản lý bài đăng</p>
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            to="/feed"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined">home</span>
            <p className="text-sm font-medium leading-normal">Về trang chủ</p>
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
            onClick={() => {
              logout();
              toast.success('Bạn đã đăng xuất');
              navigate('/');
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium leading-normal">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSideBar;


