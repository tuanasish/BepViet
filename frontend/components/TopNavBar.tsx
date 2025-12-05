import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChefHatLogo from './ChefHatLogo';
import { getStoredUser, isLoggedIn, isAdmin } from '../auth';

const TopNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-primary font-bold'
      : 'text-text-light dark:text-text-dark hover:text-primary dark:hover:text-primary font-medium';

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleNavigateProtected = (path: string) => {
    if (!isLoggedIn()) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handleNavigateAdmin = () => {
    if (!isLoggedIn()) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      navigate('/');
      return;
    }
    if (!isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      return;
    }
    navigate('/admin/dashboard');
  };

  const currentUser = getStoredUser();
  const avatarUrl =
    currentUser?.avatarUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAlToSluek5NhVhc32bpxuGRTmajzgPFOkmPoVLhuVthj6044_0QCf6Gr1Db4SyBSNjku-uNsHTU360TsXFzF0cwLPRk0DO5hdFXqcAIVMF7kcaXTAZvP5vADxhJNnpHwX4ERD2gtBUd6-wZEaORy5aH_p-K9RNoUvQrow-yWf-R8mEc-DlOkGE8J7WE0wuFrw1ZGfcS724AFI03z1txUEjcUuxDvvO_kBsxr0FKNimdO4M5IjEOkbwQVKvu8vaeH1lkZCnQvm2REw';

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="flex items-center gap-2 text-text-light dark:text-text-dark"
            >
              <div className="size-8 text-primary flex items-center justify-center">
                <ChefHatLogo className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold tracking-[-0.015em]">BepViet</h2>
            </button>
            <nav className="hidden md:flex items-center gap-8">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className={`text-sm ${isActive('/feed')}`}
              >
                Trang chủ
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/search')}
                className={`text-sm ${isActive('/search')}`}
              >
                Khám phá
              </button>
              <button
                type="button"
                onClick={() => handleNavigateProtected('/collection')}
                className={`text-sm ${isActive('/collection')}`}
              >
                Bộ sưu tập
              </button>
              {isLoggedIn() && (
                <button
                  type="button"
                  onClick={() => handleNavigateProtected('/recipe/create')}
                  className={`text-sm ${isActive('/recipe/create')}`}
                >
                  Công thức
                </button>
              )}
              <button
                type="button"
                onClick={() => handleNavigateProtected('/profile')}
                className={`text-sm ${isActive('/profile')}`}
              >
                Hồ sơ
              </button>
            </nav>
          </div>
          <div className="flex items-center justify-end gap-4">
            <label className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light text-xl">search</span>
              <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white/50 dark:bg-white/10 placeholder:text-text-muted-light focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none h-10 pl-10 pr-4 text-sm font-normal" placeholder="Tìm kiếm công thức..." />
            </label>
            <div className="flex gap-2">
              {isLoggedIn() && isAdmin() && (
                <button
                  type="button"
                  onClick={handleNavigateAdmin}
                  className="hidden lg:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20"
                >
                  Admin
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isLoggedIn()) {
                    navigate('/profile');
                  } else {
                    navigate('/login');
                  }
                }}
                className="cursor-pointer"
              >
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hover:ring-2 hover:ring-primary/50 transition-all"
                  style={{ backgroundImage: `url("${avatarUrl}")` }}
                ></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;


