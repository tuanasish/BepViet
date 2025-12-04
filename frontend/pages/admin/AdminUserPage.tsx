import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from '../../components/AdminSideBar';
import {
  apiGetAdminUsers,
  apiLockUser,
  apiUnlockUser,
  AdminUser,
} from '../../api';
import toast from 'react-hot-toast';
import { isLoggedIn, isAdmin } from '../../auth';

const AdminUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!isLoggedIn() || !isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      navigate('/');
      return;
    }

    loadUsers();
  }, [navigate, page, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminUsers(
        page,
        20,
        searchQuery || undefined,
        roleFilter || undefined,
        statusFilter || undefined
      );
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc muốn khóa tài khoản của ${userName}?`)) return;

    try {
      setProcessingId(userId);
      await apiLockUser(userId);
      toast.success('Đã khóa tài khoản thành công');
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể khóa tài khoản');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnlock = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc muốn mở khóa tài khoản của ${userName}?`)) return;

    try {
      setProcessingId(userId);
      await apiUnlockUser(userId);
      toast.success('Đã mở khóa tài khoản thành công');
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể mở khóa tài khoản');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">
                Quản lý Người dùng
              </p>
              <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">
                Xem, tìm kiếm, và quản lý tất cả người dùng trên nền tảng.
              </p>
            </div>
          </div>

          {/* SearchBar and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-muted-light dark:text-text-muted-dark flex bg-white dark:bg-card-dark items-center justify-center pl-4 rounded-l-lg border border-border-light dark:border-border-dark border-r-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark dark:placeholder:text-text-muted-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-white dark:bg-card-dark h-full placeholder:text-text-muted-light px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPage(1);
                        loadUsers();
                      }
                    }}
                  />
                </div>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark dark:text-text-dark dark:hover:bg-white/10 border border-border-light dark:border-border-dark px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark dark:text-text-dark dark:hover:bg-white/10 border border-border-light dark:border-border-dark px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Bị khóa</option>
              </select>
              <button
                onClick={() => {
                  setPage(1);
                  loadUsers();
                }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-sm">
                {loading ? (
                  <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
                    Đang tải...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
                    Không có người dùng nào
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                      <thead className="bg-gray-50 dark:bg-white/5">
                        <tr>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-1/12"
                            scope="col"
                          >
                            Người dùng
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-3/12"
                            scope="col"
                          >
                            Email
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12"
                            scope="col"
                          >
                            Vai trò
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12"
                            scope="col"
                          >
                            Ngày tạo
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12"
                            scope="col"
                          >
                            Trạng thái
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12"
                            scope="col"
                          >
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-card-dark divide-y divide-border-light dark:divide-border-dark">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                                    style={{
                                      backgroundImage: `url("${user.avatarUrl ||
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCBO36vIOR1IJDK-PRHjx2jaolH-iPg5x4CZ9-GMkn__VyYQFHgCI3sYhyxy8-4jss3muANv0pDFPgW1O0g6n_3wdn8-MA-8o-2mJElxSMhbTHcvauH3quwCpu55VtkM-GnRtL0uwiBltLFOSFqhK1ZV40H4ABoymfxgWkxJ2eN_tBfywIw9rn9E4MQm61E_h7ImDoblpU7dQtANBRAJNyEehpbyax4XtHOG3NrpilMu5Tri_uaMZiMpRphfj_2996HXJKZcN5VQrc'}")`,
                                    }}
                                  ></div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-text-light dark:text-text-dark">
                                    {user.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === 'admin'
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}
                              >
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">
                              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                }`}
                              >
                                {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                {user.status === 'locked' ? (
                                  <button
                                    onClick={() => handleUnlock(user.id, user.name)}
                                    disabled={processingId === user.id || user.role === 'admin'}
                                    className="text-text-muted-light hover:text-green-600 dark:text-text-muted-dark dark:hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mở khóa"
                                  >
                                    <span className="material-symbols-outlined">lock_open</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleLock(user.id, user.name)}
                                    disabled={processingId === user.id || user.role === 'admin'}
                                    className="text-text-muted-light hover:text-red-600 dark:text-text-muted-dark dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Khóa tài khoản"
                                  >
                                    <span className="material-symbols-outlined">lock</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserPage;
