import React, { useEffect, useState } from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getStoredUser, logout } from '../../auth';
import {
  apiGetUserSummary,
  apiUpdateAvatar,
  apiUploadImage,
  apiGetMyPosts,
  apiGetMyCollections,
  apiUpdateProfile,
  apiChangePassword,
  UserSummary,
  MyPost,
  RecipeListItem,
} from '../../api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'collections'>('posts');
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [collections, setCollections] = useState<RecipeListItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await apiGetUserSummary();
        setSummary(data);
        // Chỉ khởi tạo editForm khi summary được load lần đầu
        if (!summary) {
          setEditForm({ name: data.name, email: data.email });
        }
      } catch (err: any) {
        setError(err.message || 'Không tải được thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      load();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const loadPosts = async () => {
      if (cancelled || loadingPosts || postsLoaded) return;
      try {
        setLoadingPosts(true);
        const data = await apiGetMyPosts();
        if (!cancelled) {
          setPosts(data);
          setPostsLoaded(true);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error(err);
          toast.error(err.message || 'Không tải được bài viết');
          setPostsLoaded(true); // Đánh dấu đã thử load để tránh retry vô hạn
        }
      } finally {
        if (!cancelled) {
          setLoadingPosts(false);
        }
      }
    };

    const loadCollections = async () => {
      if (cancelled || loadingCollections || collectionsLoaded) return;
      try {
        setLoadingCollections(true);
        const data = await apiGetMyCollections();
        if (!cancelled) {
          setCollections(data);
          setCollectionsLoaded(true);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error(err);
          toast.error(err.message || 'Không tải được công thức đã lưu');
          setCollectionsLoaded(true); // Đánh dấu đã thử load để tránh retry vô hạn
        }
      } finally {
        if (!cancelled) {
          setLoadingCollections(false);
        }
      }
    };

    if (activeTab === 'posts') {
      // Chỉ load nếu chưa load lần nào
      if (!postsLoaded) {
        loadPosts();
      }
    } else {
      // Chỉ load nếu chưa load lần nào
      if (!collectionsLoaded) {
        loadCollections();
      }
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id, activeTab]);

  const handleChangeAvatar: React.ChangeEventHandler<HTMLInputElement> =
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh.');
        return;
      }

      try {
        setUpdatingAvatar(true);
        const url = await apiUploadImage(file);
        const updated = await apiUpdateAvatar(url);

        // cập nhật local storage user để TopNavBar dùng avatar mới
        const stored = getStoredUser();
        if (stored) {
          localStorage.setItem(
            'bepviet_user',
            JSON.stringify({ ...stored, avatarUrl: updated.avatarUrl })
          );
        }

        setSummary((prev) =>
          prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev
        );
        toast.success('Cập nhật ảnh đại diện thành công');
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không cập nhật được ảnh đại diện');
      } finally {
        setUpdatingAvatar(false);
        e.target.value = '';
      }
    };

  const handleCloseEditModal = () => {
    // Reset form về giá trị hiện tại từ summary khi đóng modal
    if (summary) {
      setEditForm({ name: summary.name, email: summary.email });
    }
    setShowEditModal(false);
  };

  const handleEditProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Tên không được để trống');
      return;
    }

    if (!editForm.email.trim()) {
      toast.error('Email không được để trống');
      return;
    }

    try {
      setUpdatingProfile(true);
      const updateData: { name?: string; email?: string } = {};
      
      // Chỉ gửi các trường đã thay đổi
      if (editForm.name.trim() !== summary?.name) {
        updateData.name = editForm.name.trim();
      }
      if (editForm.email.trim() !== summary?.email) {
        updateData.email = editForm.email.trim();
      }

      // Kiểm tra có thay đổi gì không
      if (Object.keys(updateData).length === 0) {
        toast.info('Không có thay đổi nào');
        handleCloseEditModal();
        return;
      }

      const updated = await apiUpdateProfile(updateData);

      // Cập nhật local storage
      const stored = getStoredUser();
      if (stored) {
        localStorage.setItem(
          'bepviet_user',
          JSON.stringify({
            ...stored,
            name: updated.name,
            email: updated.email,
          })
        );
      }

      setSummary((prev) =>
        prev
          ? {
              ...prev,
              name: updated.name,
              email: updated.email,
            }
          : prev
      );
      toast.success('Cập nhật thông tin thành công');
      handleCloseEditModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không cập nhật được thông tin');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      setChangingPassword(true);
      await apiChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không đổi được mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  const avatarUrl =
    summary?.avatarUrl ||
    user?.avatarUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCBO36vIOR1IJDK-PRHjx2jaolH-iPg5x4CZ9-GMkn__VyYQFHgCI3sYhyxy8-4jss3muANv0pDFPgW1O0g6n_3wdn8-MA-8o-2mJElxSMhbTHcvauH3quwCpu55VtkM-GnRtL0uwiBltLFOSFqhK1ZV40H4ABoymfxgWkxJ2eN_tBfywIw9rn9E4MQm61E_h7ImDoblpU7dQtANBRAJNyEehpbyax4XtHOG3NrpilMu5Tri_uaMZiMpRphfj_2996HXJKZcN5VQrc';

  return (
    <>
      <TopNavBar />
      <main className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1 gap-6">
          <div className="flex p-4 @container bg-white dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
            <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
              <div className="flex items-center gap-6">
                <label className="relative cursor-pointer">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0"
                    style={{ backgroundImage: `url("${avatarUrl}")` }}
                  ></div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChangeAvatar}
                    disabled={updatingAvatar}
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded-full">
                    {updatingAvatar ? 'Đang cập nhật...' : 'Đổi ảnh'}
                  </span>
                </label>
                <div className="flex flex-col justify-center">
                  <p className="text-text-light dark:text-text-dark text-2xl font-bold leading-tight tracking-[-0.015em]">
                    {summary?.name || user?.name || 'Người dùng BepViet'}
                  </p>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">
                    {summary?.email || user?.email || 'Chưa có email'}
                  </p>
                  <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal mt-1">
                    Thành viên BepViet
                  </p>
                </div>
              </div>
              <div className="flex w-full max-w-[480px] gap-3 @[480px]:w-auto">
                <button
                  onClick={() => {
                    if (summary) {
                      setEditForm({ name: summary.name, email: summary.email });
                    }
                    setShowEditModal(true);
                  }}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors border border-border-light dark:border-border-dark"
                >
                  <span className="truncate">Chỉnh sửa profile</span>
                </button>
                <button
                  type="button"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto hover:opacity-90 transition-opacity"
                  onClick={() => {
                    logout();
                    toast.success('Bạn đã đăng xuất');
                    navigate('/');
                  }}
                >
                  <span className="truncate">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-3 bg-white dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
            <div className="flex flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start">
              <p className="text-text-light dark:text-text-dark tracking-light text-3xl font-bold leading-tight">
                {summary?.stats.totalPosts ?? 0}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Bài viết đã đăng</p>
              </div>
            </div>
            <div className="flex flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start">
              <p className="text-text-light dark:text-text-dark tracking-light text-3xl font-bold leading-tight">
                {summary?.stats.totalCollections ?? 0}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Công thức đã lưu</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-white dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
            <div className="pb-3 pt-2">
              <div className="flex border-b border-border-light dark:border-border-dark px-4 gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('posts')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors ${
                    activeTab === 'posts'
                      ? 'border-b-primary text-primary'
                      : 'border-b-transparent text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary/90'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Bài viết của bạn
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('collections')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors ${
                    activeTab === 'collections'
                      ? 'border-b-primary text-primary'
                      : 'border-b-transparent text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary/90'
                  }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Công thức đã lưu
                  </p>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-6 gap-y-8 p-4 md:p-6">
              {activeTab === 'posts' ? (
                loadingPosts ? (
                  <p className="col-span-full text-center text-text-muted-light dark:text-text-muted-dark text-sm py-8">
                    Đang tải bài viết...
                  </p>
                ) : posts.length === 0 ? (
                  <p className="col-span-full text-center text-text-muted-light dark:text-text-muted-dark text-sm py-8">
                    Bạn chưa có bài viết nào. Hãy chia sẻ món ăn của bạn trên feed!
                  </p>
                ) : (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/feed?postId=${post.id}`}
                      className="flex flex-col gap-3 pb-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {post.imageUrls?.[0] && (
                        <div
                          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                          style={{
                            backgroundImage: `url('${post.imageUrls[0]}')`,
                          }}
                        ></div>
                      )}
                      <div>
                        <p className="text-text-light dark:text-text-dark text-base font-normal leading-relaxed whitespace-pre-wrap line-clamp-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-muted-light dark:text-text-muted-dark">
                          <span>{post.likesCount} lượt thích</span>
                          <span>•</span>
                          <span>{post.commentsCount} bình luận</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )
              ) : loadingCollections ? (
                <p className="col-span-full text-center text-text-muted-light dark:text-text-muted-dark text-sm py-8">
                  Đang tải công thức...
                </p>
              ) : collections.length === 0 ? (
                <p className="col-span-full text-center text-text-muted-light dark:text-text-muted-dark text-sm py-8">
                  Bạn chưa lưu công thức nào. Hãy khám phá và lưu những công thức yêu thích!
                </p>
              ) : (
                collections.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipe/${recipe.slug}`}
                    className="flex flex-col gap-3 pb-3 hover:opacity-80 transition-opacity"
                  >
                    {recipe.image && (
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                        style={{
                          backgroundImage: `url('${recipe.image}')`,
                        }}
                      ></div>
                    )}
                    <div>
                      <p className="text-text-light dark:text-text-dark text-base font-bold leading-normal">
                        {recipe.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-text-muted-light dark:text-text-muted-dark">{recipe.timeMinutes} phút</span>
                        <span className="text-text-muted-light dark:text-text-muted-dark">•</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                          recipe.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : recipe.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {recipe.difficulty === 'easy' ? 'Dễ' : recipe.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleCloseEditModal}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                  Chỉnh sửa thông tin
                </h2>
                <button
                  onClick={handleCloseEditModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted-light dark:text-text-muted-dark"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Tên hiển thị *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nhập tên hiển thị"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nhập email"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseEditModal}
                    className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleEditProfile}
                    disabled={updatingProfile}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60"
                  >
                    {updatingProfile ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </button>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    onClick={() => {
                      handleCloseEditModal();
                      setShowPasswordModal(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                  Đổi mật khẩu
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted-light dark:text-text-muted-dark"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60"
                  >
                    {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;


