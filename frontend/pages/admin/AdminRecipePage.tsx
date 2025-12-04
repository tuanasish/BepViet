import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from '../../components/AdminSideBar';
import {
  apiGetAdminRecipes,
  apiApproveRecipe,
  apiRejectRecipe,
  apiUpdateAdminRecipe,
  apiDeleteAdminRecipe,
  AdminRecipe,
} from '../../api';
import toast from 'react-hot-toast';
import { isLoggedIn, isAdmin } from '../../auth';

const AdminRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!isLoggedIn() || !isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      navigate('/');
      return;
    }

    loadRecipes();
  }, [navigate, page, statusFilter]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminRecipes(page, 20, statusFilter || undefined, searchQuery || undefined);
      setRecipes(data.recipes);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tải danh sách công thức');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recipeId: string) => {
    if (!window.confirm('Bạn có chắc muốn duyệt công thức này?')) return;

    try {
      setProcessingId(recipeId);
      await apiApproveRecipe(recipeId);
      toast.success('Đã duyệt công thức thành công');
      await loadRecipes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể duyệt công thức');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (recipeId: string) => {
    const reason = window.prompt('Lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled

    try {
      setProcessingId(recipeId);
      await apiRejectRecipe(recipeId, reason || undefined);
      toast.success('Đã từ chối công thức');
      await loadRecipes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể từ chối công thức');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (recipeId: string) => {
    navigate(`/admin/recipes/${recipeId}/edit`);
  };

  const handleDelete = async (recipeId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa công thức này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setProcessingId(recipeId);
      await apiDeleteAdminRecipe(recipeId);
      toast.success('Đã xóa công thức thành công');
      await loadRecipes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể xóa công thức');
    } finally {
      setProcessingId(null);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    let classes = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ';
    if (difficulty === 'easy') {
      classes += 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    } else if (difficulty === 'medium') {
      classes += 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    } else {
      classes += 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    }
    return <span className={classes}>{difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}</span>;
  };

  const getStatusBadge = (status: string) => {
    let classes = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ';
    if (status === 'published') {
      classes += 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      return <span className={classes}>Đã duyệt</span>;
    } else if (status === 'pending_review') {
      classes += 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      return <span className={classes}>Chờ duyệt</span>;
    } else if (status === 'rejected') {
      classes += 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      return <span className={classes}>Đã từ chối</span>;
    } else {
      classes += 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
      return <span className={classes}>Bản nháp</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col max-w-full flex-1">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
            <h1 className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">
              Quản lý công thức
            </h1>
            <button
              onClick={() => navigate('/admin/recipes/new')}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
            >
              + Thêm công thức
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Tìm kiếm công thức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  loadRecipes();
                }
              }}
              className="flex-1 min-w-64 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã duyệt</option>
              <option value="pending_review">Chờ duyệt</option>
              <option value="rejected">Đã từ chối</option>
              <option value="draft">Bản nháp</option>
            </select>
            <button
              onClick={() => {
                setPage(1);
                loadRecipes();
              }}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Table container */}
          <div className="flex flex-col bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
                Đang tải...
              </div>
            ) : recipes.length === 0 ? (
              <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
                Không có công thức nào
              </div>
            ) : (
              <>
                {/* Table */}
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
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[150px] text-xs font-medium uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                      {recipes.map((recipe) => (
                        <tr
                          key={recipe.id}
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="h-[72px] px-4 py-2 w-20 text-sm font-normal leading-normal">
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10"
                              style={{
                                backgroundImage: `url("${recipe.images[0] || 'https://via.placeholder.com/150'}")`,
                              }}
                            ></div>
                          </td>
                          <td className="h-[72px] px-4 py-2 min-w-[200px] text-text-light dark:text-text-dark text-sm font-medium leading-normal">
                            {recipe.title}
                          </td>
                          <td className="h-[72px] px-4 py-2 min-w-[100px] text-sm font-normal leading-normal">
                            {getDifficultyBadge(recipe.difficulty)}
                          </td>
                          <td className="h-[72px] px-4 py-2 min-w-[120px] text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">
                            {recipe.cookingTimeMinutes} phút
                          </td>
                          <td className="h-[72px] px-4 py-2 min-w-[120px] text-sm font-normal leading-normal">
                            {getStatusBadge(recipe.status || 'draft')}
                          </td>
                          <td className="h-[72px] px-4 py-2 min-w-[120px] text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">
                            {new Date(recipe.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td
                            className="h-[72px] px-4 py-2 min-w-[150px] text-text-muted-light dark:text-text-muted-dark text-sm font-bold leading-normal"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              {recipe.status === 'pending_review' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(recipe.id);
                                    }}
                                    disabled={processingId === recipe.id}
                                    className="flex size-8 items-center justify-center rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 disabled:opacity-60 transition-colors"
                                    title="Duyệt"
                                  >
                                    <span className="material-symbols-outlined text-base">check</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(recipe.id);
                                    }}
                                    disabled={processingId === recipe.id}
                                    className="flex size-8 items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 disabled:opacity-60 transition-colors"
                                    title="Từ chối"
                                  >
                                    <span className="material-symbols-outlined text-base">close</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/recipe/${recipe.id}`);
                                }}
                                className="flex size-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(recipe.id);
                                }}
                                disabled={processingId === recipe.id}
                                className="flex size-8 items-center justify-center rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 disabled:opacity-60 transition-colors"
                                title="Sửa"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(recipe.id);
                                }}
                                disabled={processingId === recipe.id}
                                className="flex size-8 items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 disabled:opacity-60 transition-colors"
                                title="Xóa"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark">
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      Hiển thị <span className="font-medium text-text-light dark:text-text-dark">{((page - 1) * 20) + 1}</span> đến{' '}
                      <span className="font-medium text-text-light dark:text-text-dark">{Math.min(page * 20, total)}</span> trong tổng số{' '}
                      <span className="font-medium text-text-light dark:text-text-dark">{total}</span> kết quả
                    </p>
                    <nav className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="flex size-9 items-center justify-center rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`text-sm font-medium leading-normal flex size-9 items-center justify-center rounded-lg ${
                              page === pageNum
                                ? 'text-white bg-primary'
                                : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="flex size-9 items-center justify-center rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRecipePage;
