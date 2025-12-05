import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from '../../components/AdminSideBar';
import {
  apiGetAdminPosts,
  apiDeleteAdminPost,
  AdminPost,
} from '../../api';
import toast from 'react-hot-toast';
import { isLoggedIn, isAdmin } from '../../auth';

const AdminPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra quyền admin
    if (!isLoggedIn() || !isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      navigate('/');
      return;
    }

    loadPosts();
  }, [navigate, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminPosts(page, 20, searchQuery || undefined);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string, authorName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài đăng của ${authorName}?`)) return;

    try {
      setProcessingId(postId);
      await apiDeleteAdminPost(postId);
      toast.success('Đã xóa bài đăng thành công');
      await loadPosts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể xóa bài đăng');
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
                Quản lý Bài đăng
              </p>
              <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">
                Xem, tìm kiếm, và quản lý tất cả bài đăng trên nền tảng.
              </p>
            </div>
          </div>

          {/* SearchBar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-muted-light dark:text-text-muted-dark flex bg-white dark:bg-card-dark items-center justify-center pl-4 rounded-l-lg border border-border-light dark:border-border-dark border-r-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark dark:placeholder:text-text-muted-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-white dark:bg-card-dark h-full placeholder:text-text-muted-light px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    placeholder="Tìm kiếm theo nội dung..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPage(1);
                        loadPosts();
                      }
                    }}
                  />
                </div>
              </label>
            </div>
            <button
              onClick={() => {
                setPage(1);
                loadPosts();
              }}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Posts List */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-sm">
                {loading ? (
                  <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
                    Đang tải...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center text-text-muted-light dark:text-text-muted-dark">
                    Không có bài đăng nào
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-border-light dark:divide-border-dark">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shrink-0"
                              style={{
                                backgroundImage: `url("${post.authorAvatarUrl ||
                                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBO36vIOR1IJDK-PRHjx2jaolH-iPg5x4CZ9-GMkn__VyYQFHgCI3sYhyxy8-4jss3muANv0pDFPgW1O0g6n_3wdn8-MA-8o-2mJElxSMhbTHcvauH3quwCpu55VtkM-GnRtL0uwiBltLFOSFqhK1ZV40H4ABoymfxgWkxJ2eN_tBfywIw9rn9E4MQm61E_h7ImDoblpU7dQtANBRAJNyEehpbyax4XtHOG3NrpilMu5Tri_uaMZiMpRphfj_2996HXJKZcN5VQrc'}")`,
                              }}
                            ></div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-text-light dark:text-text-dark text-sm font-bold">
                                  {post.authorName}
                                </p>
                                {post.authorEmail && (
                                  <p className="text-text-muted-light dark:text-text-muted-dark text-xs">
                                    ({post.authorEmail})
                                  </p>
                                )}
                                <span className="text-text-muted-light dark:text-text-muted-dark text-xs">
                                  •
                                </span>
                                <p className="text-text-muted-light dark:text-text-muted-dark text-xs">
                                  {new Date(post.createdAt).toLocaleString('vi-VN')}
                                </p>
                              </div>

                              <p className="text-text-light dark:text-text-dark text-sm mb-3 whitespace-pre-wrap">
                                {post.content}
                              </p>

                              {/* Images */}
                              {post.imageUrls && post.imageUrls.length > 0 && (
                                <div className="mb-3">
                                  <div className="grid grid-cols-2 gap-2 max-w-md">
                                    {post.imageUrls.slice(0, 4).map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                                        style={{
                                          backgroundImage: `url("${img}")`,
                                        }}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-text-muted-light dark:text-text-muted-dark text-xs mb-3">
                                <span>{post.likesCount} lượt thích</span>
                                <span>{post.commentsCount} bình luận</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/feed?postId=${post.id}`)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark hover:text-primary text-xs font-medium transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base">visibility</span>
                                  Xem chi tiết
                                </button>
                                <button
                                  onClick={() => handleDelete(post.id, post.authorName)}
                                  disabled={processingId === post.id}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 disabled:opacity-60 text-xs font-medium transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPostPage;




