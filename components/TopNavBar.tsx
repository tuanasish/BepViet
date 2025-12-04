import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChefHatLogo from './ChefHatLogo';

const TopNavBar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? "text-primary font-bold" : "text-text-light dark:text-text-dark hover:text-primary dark:hover:text-primary font-medium";

  return (
    <header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark w-full">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="flex h-16 items-center justify-between whitespace-nowrap">
          <div class="flex items-center gap-8">
            <Link to="/feed" class="flex items-center gap-2 text-text-light dark:text-text-dark">
              <div class="size-8 text-primary flex items-center justify-center">
                <ChefHatLogo className="w-7 h-7" />
              </div>
              <h2 class="text-xl font-bold tracking-[-0.015em]">BepViet</h2>
            </Link>
            <nav class="hidden md:flex items-center gap-8">
              <Link to="/feed" class={`text-sm ${isActive('/feed')}`}>Trang chủ</Link>
              <Link to="/search" class={`text-sm ${isActive('/search')}`}>Khám phá</Link>
              <Link to="/collection" class={`text-sm ${isActive('/collection')}`}>Bộ sưu tập</Link>
              <Link to="/profile" class={`text-sm ${isActive('/profile')}`}>Hồ sơ</Link>
            </nav>
          </div>
          <div class="flex items-center justify-end gap-4">
            <label class="relative hidden sm:block">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light text-xl">search</span>
              <input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white/50 dark:bg-white/10 placeholder:text-text-muted-light focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none h-10 pl-10 pr-4 text-sm font-normal" placeholder="Tìm kiếm công thức..." />
            </label>
            <div class="flex gap-2">
                 <Link to="/admin/dashboard" class="hidden lg:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20">
                    Admin
                </Link>
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlToSluek5NhVhc32bpxuGRTmajzgPFOkmPoVLhuVthj6044_0QCf6Gr1Db4SyBSNjku-uNsHTU360TsXFzF0cwLPRk0DO5hdFXqcAIVMF7kcaXTAZvP5vADxhJNnpHwX4ERD2gtBUd6-wZEaORy5aH_p-K9RNoUvQrow-yWf-R8mEc-DlOkGE8J7WE0wuFrw1ZGfcS724AFI03z1txUEjcUuxDvvO_kBsxr0FKNimdO4M5IjEOkbwQVKvu8vaeH1lkZCnQvm2REw")'}}></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
