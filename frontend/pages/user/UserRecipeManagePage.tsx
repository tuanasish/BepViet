import React, { useEffect, useState } from 'react';
import TopNavBar from '../../components/TopNavBar';
import { useNavigate } from 'react-router-dom';
import { apiGetMyRecipesForAttach, UserRecipeSummary } from '../../api';
import { isLoggedIn } from '../../auth';
import toast from 'react-hot-toast';

const UserRecipeManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<UserRecipeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'pending_review' | 'published' | 'rejected'
  >('all');

  useEffect(() => {
    if (!isLoggedIn()) {
      toast.error('Bạn cần đăng nhập để xem công thức của bạn');
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const statusParam =
          statusFilter === 'all' ? undefined : statusFilter;
        const data = await apiGetMyRecipesForAttach(statusParam);
        if (!cancelled) {
          setRecipes(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Không tải được danh sách công thức của bạn');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background-light dark:bg-background-dark">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <h1 className="text-text-light dark:text-text-dark text-2xl md:text-3xl font-bold leading-tight">
              Công thức của bạn
            </h1>
            <button
              type="button"
              onClick={() => navigate('/recipe/new')}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
            >
              + Tạo công thức mới
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full border ${
                statusFilter === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-full border ${
                statusFilter === 'draft'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Nháp
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending_review')}
              className={`px-3 py-1 rounded-full border ${
                statusFilter === 'pending_review'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-full border ${
                statusFilter === 'published'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Đã duyệt
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1 rounded-full border ${
                statusFilter === 'rejected'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Bị từ chối
            </button>
          </div>

          <div className="flex flex-col bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            {loading ? (
              <div className="p-6 text-center text-text-muted-light dark:text-text-muted-dark text-sm">
                Đang tải công thức của bạn...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-red-500">
                {error}
              </div>
            ) : recipes.length === 0 ? (
              <div className="p-6 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
                Chưa có công thức nào ở trạng thái này. Hãy bấm &quot;Tạo công thức mới&quot; để bắt đầu.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5">
                      <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark w-20 text-xs font-medium uppercase tracking-wider">
                        Ảnh
                      </th>
                      <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[200px] text-xs font-medium uppercase tracking-wider">
                        Tên món
                      </th>
                      <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">
                        Độ khó
                      </th>
                      <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {recipes.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="h-[64px] px-4 py-2 w-20 text-sm">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10"
                            style={{
                              backgroundImage: `url("${r.image ||
                                'https://via.placeholder.com/150'}")`,
                            }}
                          ></div>
                        </td>
                        <td className="h-[64px] px-4 py-2 min-w-[200px] text-text-light dark:text-text-dark text-sm font-medium">
                          {r.title}
                        </td>
                        <td className="h-[64px] px-4 py-2 min-w-[100px] text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              r.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : r.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            }`}
                          >
                            {r.difficulty === 'easy'
                              ? 'Dễ'
                              : r.difficulty === 'medium'
                              ? 'Trung bình'
                              : 'Khó'}
                          </span>
                        </td>
                        <td className="h-[64px] px-4 py-2 min-w-[120px] text-text-muted-light dark:text-text-muted-dark text-sm">
                          {r.timeMinutes} phút
                        </td>
                        <td className="h-[64px] px-4 py-2 min-w-[120px] text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              r.status === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : r.status === 'pending_review'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                : r.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                            }`}
                          >
                            {r.status === 'published'
                              ? 'Đã duyệt'
                              : r.status === 'pending_review'
                              ? 'Chờ duyệt'
                              : r.status === 'rejected'
                              ? 'Đã từ chối'
                              : 'Bản nháp'}
                          </span>
                        </td>
                        <td className="h-[64px] px-4 py-2 min-w-[120px] text-sm">
                          {r.status === 'published' ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/recipe/${r.slug}`)}
                              className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                            >
                              Xem chi tiết
                            </button>
                          ) : (
                            <span className="text-text-muted-light dark:text-text-muted-dark text-xs">
                              Đang chờ admin xử lý
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default UserRecipeManagePage;





