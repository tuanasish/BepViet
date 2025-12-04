import React from 'react';
import AdminSideBar from '../../components/AdminSideBar';

const AdminDashboardPage: React.FC = () => {
  return (
    <div class="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div class="w-full max-w-7xl mx-auto">
          {/* PageHeading */}
          <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h1 class="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">Dashboard</h1>
          </div>
          {/* Stats */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div class="flex items-center justify-between">
                <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Tổng số công thức</p>
                <span class="material-symbols-outlined text-primary">menu_book</span>
              </div>
              <p class="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">1,234</p>
              <p class="text-[#07880e] text-sm font-medium leading-normal">+5.2% so với tháng trước</p>
            </div>
            <div class="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div class="flex items-center justify-between">
                <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Tổng số người dùng</p>
                <span class="material-symbols-outlined text-primary">group</span>
              </div>
              <p class="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">5,678</p>
              <p class="text-[#07880e] text-sm font-medium leading-normal">+2.1% so với tháng trước</p>
            </div>
            <div class="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div class="flex items-center justify-between">
                <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Bài viết mới hôm nay</p>
                <span class="material-symbols-outlined text-primary">add_circle</span>
              </div>
              <p class="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">45</p>
              <p class="text-[#07880e] text-sm font-medium leading-normal">+10% so với hôm qua</p>
            </div>
            <div class="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div class="flex items-center justify-between">
                <p class="text-text-light dark:text-text-dark text-base font-medium leading-normal">Chờ duyệt</p>
                <span class="material-symbols-outlined text-primary">pending_actions</span>
              </div>
              <p class="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">12</p>
              <p class="text-red-600 text-sm font-medium leading-normal">+3 so với hôm qua</p>
            </div>
          </div>
          {/* Charts */}
          <div class="flex flex-wrap gap-6">
            <div class="flex min-w-72 flex-1 flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark p-6 bg-white dark:bg-card-dark shadow-sm">
              <div class="flex justify-between items-center">
                <p class="text-text-light dark:text-text-dark text-lg font-bold leading-normal">Xu hướng gửi công thức</p>
                <div class="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                  <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">7 ngày qua</p>
                  <span class="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-base">expand_more</span>
                </div>
              </div>
              <div class="flex items-end h-64 w-full gap-4 px-2">
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40" style={{height: '70%'}}></div>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">T2</p>
                </div>
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40" style={{height: '40%'}}></div>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">T3</p>
                </div>
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40" style={{height: '60%'}}></div>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">T4</p>
                </div>
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40" style={{height: '55%'}}></div>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">T5</p>
                </div>
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary w-full rounded-t-lg hover:brightness-110 transition-all" style={{height: '85%'}}></div>
                  <p class="text-text-light dark:text-text-dark text-xs font-bold tracking-[0.015em]">T6</p>
                </div>
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40" style={{height: '75%'}}></div>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">T7</p>
                </div>
                <div class="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div class="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40" style={{height: '80%'}}></div>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">CN</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
