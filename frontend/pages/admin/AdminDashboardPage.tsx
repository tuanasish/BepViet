import React, { useEffect, useState } from 'react';
import AdminSideBar from '../../components/AdminSideBar';
import { apiGetAdminOverview } from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from '../../auth';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<{
    totalUsers: number;
    totalRecipes: number;
    totalPosts: number;
    pendingRecipes: number;
    postsToday: number;
    recipesToday: number;
    usersToday: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!isLoggedIn() || !isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      navigate('/');
      return;
    }

    const loadOverview = async () => {
      try {
        setLoading(true);
        const data = await apiGetAdminOverview();
        setOverview(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không thể tải thống kê tổng quan');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
        <AdminSideBar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
            <p className="text-center text-text-muted-light dark:text-text-muted-dark">
              Đang tải...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
              Dashboard
            </h1>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
                  Tổng số công thức
                </p>
                <span className="material-symbols-outlined text-primary">menu_book</span>
              </div>
              <p className="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">
                {overview?.totalRecipes.toLocaleString('vi-VN') || 0}
              </p>
              <p className="text-[#07880e] text-sm font-medium leading-normal">
                {overview?.recipesToday || 0} mới hôm nay
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
                  Tổng số người dùng
                </p>
                <span className="material-symbols-outlined text-primary">group</span>
              </div>
              <p className="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">
                {overview?.totalUsers.toLocaleString('vi-VN') || 0}
              </p>
              <p className="text-[#07880e] text-sm font-medium leading-normal">
                {overview?.usersToday || 0} mới hôm nay
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
                  Tổng số bài viết
                </p>
                <span className="material-symbols-outlined text-primary">add_circle</span>
              </div>
              <p className="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">
                {overview?.totalPosts.toLocaleString('vi-VN') || 0}
              </p>
              <p className="text-[#07880e] text-sm font-medium leading-normal">
                {overview?.postsToday || 0} mới hôm nay
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
                  Chờ duyệt
                </p>
                <span className="material-symbols-outlined text-primary">pending_actions</span>
              </div>
              <p className="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">
                {overview?.pendingRecipes || 0}
              </p>
              {overview && overview.pendingRecipes > 0 && (
                <p className="text-red-600 text-sm font-medium leading-normal">
                  Cần xử lý ngay
                </p>
              )}
              {overview && overview.pendingRecipes === 0 && (
                <p className="text-[#07880e] text-sm font-medium leading-normal">
                  Không có công thức chờ duyệt
                </p>
              )}
            </div>
          </div>
          {/* Charts */}
          <div className="flex flex-wrap gap-6">
            <div className="flex min-w-72 flex-1 flex-col gap-4 rounded-xl border border-border-light dark:border-border-dark p-6 bg-white dark:bg-card-dark shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-text-light dark:text-text-dark text-lg font-bold leading-normal">
                  Xu hướng gửi công thức
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                  <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                    7 ngày qua
                  </p>
                  <span className="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-base">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="flex items-end h-64 w-full gap-4 px-2">
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40"
                    style={{ height: '70%' }}
                  ></div>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">
                    T2
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40"
                    style={{ height: '40%' }}
                  ></div>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">
                    T3
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40"
                    style={{ height: '60%' }}
                  ></div>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">
                    T4
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40"
                    style={{ height: '55%' }}
                  ></div>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">
                    T5
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary w-full rounded-t-lg hover:brightness-110 transition-all"
                    style={{ height: '85%' }}
                  ></div>
                  <p className="text-text-light dark:text-text-dark text-xs font-bold tracking-[0.015em]">
                    T6
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40"
                    style={{ height: '75%' }}
                  ></div>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">
                    T7
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end h-full w-full gap-2">
                  <div
                    className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-lg transition-all hover:bg-primary/40"
                    style={{ height: '80%' }}
                  ></div>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium tracking-[0.015em]">
                    CN
                  </p>
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
