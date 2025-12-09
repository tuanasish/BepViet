import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TopNavBar from '../../components/TopNavBar';
import {
  apiCommentPost,
  apiCreatePost,
  apiDeleteComment,
  apiGetFeed,
  apiGetPostById,
  apiGetPostComments,
  apiLikePost,
  apiUnlikePost,
  apiUploadImage,
  apiGetRecipeTags,
  apiGetMyRecipesForAttach,
  apiRatePost,
  apiViewPost,
  FeedPost,
  PostComment,
  FeedSort,
  UserRecipeSummary,
} from '../../api';
import { getStoredUser, isLoggedIn } from '../../auth';
import { timeAgo } from '../../utils/timeAgo';

type FeedPostWithUI = FeedPost & {
  liked?: boolean;
  isLiking?: boolean;
  isCommenting?: boolean;
  ratingCount?: number;
  averageRating?: number;
  viewsCount?: number;
};

const FeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedPostId = searchParams.get('postId');
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navigate = useNavigate();

  const [posts, setPosts] = useState<FeedPostWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<FeedSort>('latest');
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newPostImageUrl, setNewPostImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, PostComment[] | undefined>
  >({});
  const [commentsLoading, setCommentsLoading] = useState<
    Record<string, boolean | undefined>
  >({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [recipeTags, setRecipeTags] = useState<string[]>([]);
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [myRecipes, setMyRecipes] = useState<UserRecipeSummary[]>([]);
  const [loadingMyRecipes, setLoadingMyRecipes] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const viewedPostIdsRef = useRef<Set<string>>(new Set());
  const user = useMemo(() => getStoredUser(), []);
  const loggedIn = isLoggedIn();

  const goToSearchWith = (params: Record<string, string>) => {
    const sp = new URLSearchParams(params);
    navigate(`/search?${sp.toString()}`);
  };

  // Load danh sách tag công thức để sidebar dùng đúng tag đang có
  useEffect(() => {
    let cancelled = false;
    const loadTags = async () => {
      try {
        const data = await apiGetRecipeTags();
        if (!cancelled && Array.isArray(data.tags)) {
          setRecipeTags(
            data.tags
              .filter((t) => t && t.trim())
              .map((t) => t.trim())
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadTags();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasTag = (label: string) =>
    recipeTags.some((t) => t.toLowerCase() === label.toLowerCase());

  const openAttachModal = async () => {
    if (!loggedIn) {
      alert('Bạn cần đăng nhập để gắn công thức.');
      return;
    }
    setAttachModalOpen(true);
    try {
      setLoadingMyRecipes(true);
      // Chỉ cho phép gắn công thức đã được duyệt
      const data = await apiGetMyRecipesForAttach('published');
      setMyRecipes(data);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : 'Không tải được danh sách công thức của bạn.'
      );
    } finally {
      setLoadingMyRecipes(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadFeed = async () => {
      try {
        // Nếu có highlightedPostId, load bài viết đó trước
        let highlightedPost: FeedPostWithUI | null = null;
        if (highlightedPostId) {
          try {
            const postData = await apiGetPostById(highlightedPostId);
            highlightedPost = postData as FeedPostWithUI;
          } catch (err) {
            console.error('Failed to load highlighted post', err);
            // Nếu không load được bài viết cụ thể, vẫn tiếp tục load feed bình thường
          }
        }

        // Load feed bình thường (có phân trang + sort)
        const feedData = await apiGetFeed(page, sortBy);

        if (cancelled) return;

        setTotalPages(feedData.totalPages || 1);

        let finalPosts: FeedPostWithUI[] = (feedData.posts ||
          []) as FeedPostWithUI[];

        // Nếu có highlightedPost, đặt nó ở đầu và loại bỏ duplicate nếu có trong feed
        if (highlightedPost) {
          finalPosts = [
            highlightedPost,
            ...finalPosts.filter((p) => p.id !== highlightedPost!.id),
          ];
        }

        setPosts(finalPosts);

        // Scroll đến bài viết được highlight sau khi render
        if (highlightedPostId && highlightedPost) {
          setTimeout(() => {
            const element = postRefs.current[highlightedPostId];
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight bài viết bằng cách thêm border hoặc background
              element.style.border = '2px solid #3b82f6';
              element.style.borderRadius = '0.5rem';
              setTimeout(() => {
                element.style.border = '';
              }, 3000);
            }
          }, 100);
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'Không tải được feed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, [highlightedPostId, page, sortBy]);

  // Gửi lượt xem cho các bài viết trên feed (mỗi bài 1 lần mỗi phiên)
  useEffect(() => {
    if (!loggedIn) return;
    const viewedSet = viewedPostIdsRef.current;
    const toView = posts
      .map((p) => p.id)
      .filter((id) => id && !viewedSet.has(id));
    if (toView.length === 0) return;

    toView.forEach(async (postId) => {
      try {
        viewedSet.add(postId);
        const res = await apiViewPost(postId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, viewsCount: res.viewsCount } : p
          )
        );
      } catch (err) {
        console.error('Failed to record view for post', postId, err);
      }
    });
  }, [posts, loggedIn]);

  const handleCreatePost = async () => {
    if (!loggedIn) {
      alert('Bạn cần đăng nhập để đăng bài.');
      return;
    }
    if (!newPostContent.trim()) return;

    try {
      setPosting(true);
      const created = await apiCreatePost(
        newPostContent.trim(),
        newPostImageUrl || undefined,
        selectedRecipeId || undefined
      );
      setPosts((prev) => [
        {
          ...created,
          authorName: user?.name || created.authorName,
          authorAvatarUrl: created.authorAvatarUrl || user?.avatarUrl || null,
        },
        ...prev,
      ]);
      setNewPostContent('');
      setNewPostImageUrl(null);
      setSelectedRecipeId(null);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : 'Không đăng được bài, thử lại sau.'
      );
    } finally {
      setPosting(false);
    }
  };

  const handlePickImage = () => {
    if (!loggedIn) {
      alert('Bạn cần đăng nhập để chọn ảnh.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh.');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await apiUploadImage(file);
      setNewPostImageUrl(url);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : 'Không upload được ảnh, thử lại sau.'
      );
    } finally {
      setUploadingImage(false);
      // cho phép chọn lại cùng file nếu cần
      e.target.value = '';
    }
  };

  const handleToggleLike = async (postId: string, liked?: boolean) => {
    if (!loggedIn) {
      alert('Bạn cần đăng nhập để thích bài viết.');
      return;
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiking: true } : p
      )
    );

    try {
      if (liked) {
        await apiUnlikePost(postId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  liked: false,
                  likesCount: Math.max(0, p.likesCount - 1),
                  isLiking: false,
                }
              : p
          )
        );
      } else {
        await apiLikePost(postId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  liked: true,
                  likesCount: p.likesCount + 1,
                  isLiking: false,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : 'Không thể cập nhật lượt thích, thử lại sau.'
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiking: false } : p
        )
      );
    }
  };

  const handleLoadComments = async (postId: string) => {
    // Nếu đã load rồi thì bỏ qua
    if (commentsByPost[postId]) return;

    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const data = await apiGetPostComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : 'Không thể tải bình luận, thử lại sau.'
      );
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!loggedIn) {
      alert('Bạn cần đăng nhập để bình luận.');
      return;
    }
    const text = commentText[postId]?.trim();
    if (!text) return;

    setCommentingPost(postId);
    try {
      await apiCommentPost(postId, text);

      // Tự tăng bộ đếm và thêm vào danh sách (nếu đã load)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, commentsCount: p.commentsCount + 1 }
            : p
        )
      );

      setCommentsByPost((prev) => {
        const existing = prev[postId];
        if (!existing) return prev;
        const newComment: PostComment = {
          id: `tmp-${Date.now()}`,
          userId: user?.id || '',
          userName: user?.name || 'Bạn',
          content: text,
          createdAt: new Date().toISOString(),
        };
        return {
          ...prev,
          [postId]: [...existing, newComment],
        };
      });

      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : 'Không thể bình luận, thử lại sau.'
      );
    } finally {
      setCommentingPost(null);
    }
  };

  const handleDeleteComment = async (postId: string, comment: PostComment) => {
    if (!loggedIn) {
      alert('Bạn cần đăng nhập để xoá bình luận.');
      return;
    }

    if (
      comment.userId !== user?.id &&
      user?.role !== 'admin'
    ) {
      alert('Bạn không có quyền xoá bình luận này.');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xoá bình luận này?')) return;

    try {
      await apiDeleteComment(comment.id);
      setCommentsByPost((prev) => {
        const existing = prev[postId];
        if (!existing) return prev;
        return {
          ...prev,
          [postId]: existing.filter((c) => c.id !== comment.id),
        };
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                commentsCount: Math.max(0, p.commentsCount - 1),
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : 'Không thể xoá bình luận, thử lại sau.'
      );
    }
  };

  return (
    <>
      <TopNavBar />
      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]">
          {/* Left column: Feed */}
          <div className="flex flex-col gap-6">
            {/* Composer Card */}
          <div className="flex flex-col gap-2 p-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark">
            <div className="flex items-start gap-3">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 mt-1"
                style={{
                  backgroundImage: `url("${user?.avatarUrl ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDgj3Iprg3wlv0Y5cyKYxmpL-0HXbkYtlkxM9Xekg420rJR6C_FI2t6cojwg89j6TRYFxU-me_7D2-OTmiD8kLtS79vQenTxl2AmcEXWqeesI2SnXA1CeJ6ghBH3wFy2l0WsA3dpv-BniHp-i2ut5P8O_fGNq8sjXVqvGxhfoLc2wY8__8y-yXX28RjyoVjQwylqT8T2sKlwx5ZOHTn3BTuotQAEF9ducvK33fJZaclWfmyEEwscojllfr4quFZLF989GSCWUfjbE8'}")`,
                }}
              ></div>
              <textarea
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-transparent h-24 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark text-base font-normal leading-normal pt-3"
                placeholder={
                  loggedIn
                    ? 'Hôm nay bạn nấu gì thế?'
                    : 'Đăng nhập để chia sẻ món bạn nấu hôm nay...'
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={posting || !loggedIn}
              />
            </div>
            <div className="flex items-center justify-between pl-14">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePickImage}
                  className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark disabled:opacity-60"
                  disabled={!loggedIn || uploadingImage}
                >
                  <span className="material-symbols-outlined text-sm">
                    image
                  </span>
                  <span className="text-sm font-medium">
                    {uploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh'}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={openAttachModal}
                  className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark"
                >
                  <span className="material-symbols-outlined text-sm">
                    link
                  </span>
                  <span className="text-sm font-medium">
                    {selectedRecipeId ? 'Đã gắn công thức' : 'Gắn công thức'}
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={posting || !loggedIn || !newPostContent.trim()}
                className="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="truncate">
                  {posting ? 'Đang đăng...' : 'Đăng bài'}
                </span>
              </button>
            </div>
            {newPostImageUrl && (
              <div className="pl-14 mt-2">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg max-w-md"
                  style={{
                    backgroundImage: `url("${newPostImageUrl}")`,
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* Sort buttons */}
          <div className="flex items-center justify-end gap-2 text-sm">
            <span className="text-text-muted-light dark:text-text-muted-dark">
              Sắp xếp:
            </span>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setSortBy('latest');
              }}
              className={`px-3 py-1 rounded-full border text-xs md:text-sm transition-colors ${
                sortBy === 'latest'
                  ? 'bg-primary/10 text-primary border-primary/40'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Mới nhất
            </button>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setSortBy('likes');
              }}
              className={`px-3 py-1 rounded-full border text-xs md:text-sm transition-colors ${
                sortBy === 'likes'
                  ? 'bg-primary/10 text-primary border-primary/40'
                  : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              Nhiều like
            </button>
          </div>

          {loading && (
            <p className="text-center text-text-muted-light dark:text-text-muted-dark text-sm">
              Đang tải feed...
            </p>
          )}
          {error && !loading && (
            <p className="text-center text-red-500 text-sm">{error}</p>
          )}
          {!loading && !error && posts.length === 0 && (
            <p className="text-center text-text-muted-light dark:text-text-muted-dark text-sm">
              Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ món ăn của
              bạn!
            </p>
          )}

          {/* Feed posts */}
          {posts.map((post) => {
            const comments = commentsByPost[post.id];
            const isCommentsLoading = commentsLoading[post.id];
            const authorAvatar =
              post.authorAvatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuC8xba3lY4NQYnWhNgbdK9M2Am-ltwp41RwNcJ3cGIFOZnD3CEOwBvoBHuQsRWyQPRzGcT-Ip1wQdPa1Xg_i2fdLGY2l3EYp30rTTBBFVoawOwau9d17BCzXdgRYKjUg-jXPg_nbcWWnupRyCcKf2xsU7NnVCNljOj2YQJT4DL941unffQ_sfMzYkx8YphEREyxRey24bPhAWsg1-og_8MU8H338q-fc-5st08aePhkKNqkeLQYpZYARrNPrVCtS26OGUdkmBQCGes';

            const isHighlighted = highlightedPostId === post.id;

            return (
              <div
                key={post.id}
                ref={(el) => {
                  if (isHighlighted) {
                    postRefs.current[post.id] = el;
                  }
                }}
                className="flex flex-col gap-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                      style={{
                        backgroundImage: `url("${authorAvatar}")`,
                      }}
                    ></div>
                    <div>
                      <p className="text-text-light dark:text-text-dark text-sm font-bold leading-normal">
                        {post.authorName}
                      </p>
                      <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-normal leading-normal">
                        {timeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center size-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark"
                  >
                    <span className="material-symbols-outlined text-base">
                      more_horiz
                    </span>
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-text-light dark:text-text-dark text-base font-normal leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {post.relatedRecipe && (
                    <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 flex items-center gap-3">
                      {post.relatedRecipe.image && (
                        <div
                          className="w-16 h-16 rounded-md bg-center bg-cover bg-no-repeat flex-shrink-0"
                          style={{
                            backgroundImage: `url("${post.relatedRecipe.image}")`,
                          }}
                        ></div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                          {post.relatedRecipe.title}
                        </p>
                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
                          {post.relatedRecipe.timeMinutes} phút ·{' '}
                          {post.relatedRecipe.difficulty === 'easy'
                            ? 'Dễ'
                            : post.relatedRecipe.difficulty === 'medium'
                            ? 'Trung bình'
                            : 'Khó'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/recipe/${post.relatedRecipe!.slug}`)
                        }
                        className="text-xs px-3 py-1 rounded-full bg-primary text-white font-semibold hover:bg-primary/90"
                      >
                        Xem công thức
                      </button>
                    </div>
                  )}
                  {post.imageUrls?.[0] && (
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                      style={{
                        backgroundImage: `url("${post.imageUrls[0]}")`,
                      }}
                    ></div>
                  )}
                  {/* Rating & views */}
                  <div className="flex items-center justify-between text-xs text-text-muted-light dark:text-text-muted-dark px-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={async () => {
                            if (!loggedIn) {
                              alert('Bạn cần đăng nhập để đánh giá bài viết.');
                              return;
                            }
                            try {
                              const res = await apiRatePost(post.id, star);
                              setPosts((prev) =>
                                prev.map((p) =>
                                  p.id === post.id
                                    ? {
                                        ...p,
                                        ratingCount: res.ratingCount,
                                        averageRating: res.averageRating,
                                      }
                                    : p
                                )
                              );
                            } catch (err) {
                              console.error(err);
                              alert(
                                err instanceof Error
                                  ? err.message
                                  : 'Không thể đánh giá bài viết, thử lại sau.'
                              );
                            }
                          }}
                          className="flex items-center justify-center"
                        >
                          <span
                            className="material-symbols-outlined text-base"
                            style={{
                              color:
                                (post.averageRating || 0) >= star
                                  ? '#facc15'
                                  : '#9ca3af',
                              fontVariationSettings:
                                '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20',
                            }}
                          >
                            star
                          </span>
                        </button>
                      ))}
                      <span className="ml-1">
                        {post.averageRating ? post.averageRating.toFixed(1) : '0.0'}{' '}
                        ({post.ratingCount || 0} đánh giá)
                      </span>
                    </div>
                    <span>{post.viewsCount || 0} lượt xem</span>
                  </div>
                </div>

                <div className="border-t border-border-light dark:border-border-dark pt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-text-muted-light dark:text-text-muted-dark px-1">
                    <span>{post.likesCount} lượt thích</span>
                    <span>{post.commentsCount} bình luận</span>
                  </div>
                  <div className="flex items-center -mx-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id, post.liked)}
                      disabled={post.isLiking}
                      className="flex flex-1 items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark disabled:opacity-60"
                    >
                      <span
                        className="material-symbols-outlined text-base"
                        style={
                          post.liked
                            ? {
                                color: '#ef4444', // red-500
                                fontVariationSettings:
                                  '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
                              }
                            : undefined
                        }
                      >
                        {post.liked ? 'favorite' : 'favorite_border'}
                      </span>
                      <span className="text-sm font-medium">
                        {post.liked ? 'Đã thích' : 'Thích'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadComments(post.id)}
                      className="flex flex-1 items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark"
                    >
                      <span className="material-symbols-outlined text-base">
                        chat_bubble
                      </span>
                      <span className="text-sm font-medium">Bình luận</span>
                    </button>
                  </div>

                  {/* Comment input */}
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0"
                      style={{
                        backgroundImage: `url("${user?.avatarUrl ||
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuAI_CJHL_hDHHyUVr6K6t6V1pUSk42crM3Ck227NlBNf08wFkvPK2lI6oJN3pBjdZGvGUT_AUfz4ZtN9JVJFXrS2Cmg-UjHMFoM_5d5tYzGyYgx9Kqr2adtOP1bKpGaT8DXamuYsJIFnuahKbVxwDmu6DHQzqqKmtl7c-8fDVJ2qmbGI1dS69tznd7XOsJn2gvQpsUg-0_d8CqiYQTOqOG9Dqy1MUIkcfTMYBD0DMMBBF5F55mo6uIIgxxzTVRP9Y6RNR8CZxhj30I'}")`,
                      }}
                    ></div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-text-light dark:text-text-dark focus:outline-0 focus:ring-1 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-white/5 h-9 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark px-4 text-sm font-normal leading-normal"
                      placeholder={
                        loggedIn
                          ? 'Viết bình luận...'
                          : 'Đăng nhập để bình luận...'
                      }
                      value={commentText[post.id] || ''}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCommentSubmit(post.id);
                        }
                      }}
                      disabled={commentingPost === post.id || !loggedIn}
                    />
                  </div>

                  {/* Comments list */}
                  {isCommentsLoading && (
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark px-2 pt-1">
                      Đang tải bình luận...
                    </p>
                  )}
                  {comments && comments.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start gap-2 px-1"
                        >
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7 shrink-0 mt-0.5"
                            style={{
                              backgroundImage: `url("${c.userAvatarUrl ||
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuBWNXefvDPSWGCS8iEdkycNYuiZPBfzRHHrbPOhaTYzq-r3j3vGzq1ABRMz4MHupNWy-qvI4aEL_kHMfauXkpKhm_QwsC-e_nww9FMz5X3dZx2mG8fFOS9H2pGeu02fabiWOh2EFxPpN3PNbcwtSFSbRM9swdH-G2obOQhTi5ZdNAKGYM5FChvJ9h2eAHH16BqrozCEGWr_gyEM2ElBNrrGPFJmi47vBRPh5vlu-afQa3BHS2PLAjxw1y8eYdiBmrnZJOnAju6oux4'}")`,
                            }}
                          ></div>
                          <div className="flex-1 bg-background-light dark:bg-white/5 rounded-2xl px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-text-light dark:text-text-dark">
                                {c.userName}
                              </p>
                              {(c.userId === user?.id ||
                                user?.role === 'admin') && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteComment(post.id, c)
                                  }
                                  className="text-[11px] text-text-muted-light dark:text-text-muted-dark hover:underline"
                                >
                                  Xoá
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-text-light dark:text-text-dark mt-0.5">
                              {c.content}
                            </p>
                            <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark mt-0.5">
                              {timeAgo(c.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg text-sm border border-border-light dark:border-border-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10"
              >
                Trang trước
              </button>
              <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg text-sm border border-border-light dark:border-border-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10"
              >
                Trang sau
              </button>
            </div>
          )}
          </div>

          {/* Attach Recipe Modal */}
          {attachModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
              onClick={() => setAttachModalOpen(false)}
            >
              <div
                className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
                  <h2 className="text-base font-semibold text-text-light dark:text-text-dark">
                    Gắn công thức vào bài viết
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAttachModalOpen(false)}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark"
                  >
                    <span className="material-symbols-outlined text-base">
                      close
                    </span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Danh sách công thức của bạn */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">
                        Công thức của bạn
                      </h3>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setLoadingMyRecipes(true);
                            const data = await apiGetMyRecipesForAttach();
                            setMyRecipes(data);
                          } catch (err) {
                            console.error(err);
                            alert(
                              err instanceof Error
                                ? err.message
                                : 'Không tải được danh sách công thức của bạn.'
                            );
                          } finally {
                            setLoadingMyRecipes(false);
                          }
                        }}
                        className="text-xs px-2 py-1 rounded-full border border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Tải lại
                      </button>
                    </div>
                    {loadingMyRecipes ? (
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        Đang tải công thức...
                      </p>
                    ) : myRecipes.length === 0 ? (
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        Bạn chưa có công thức đã được duyệt. Hãy vào trang Công thức để tạo và chờ admin duyệt trước khi gắn vào bài viết.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {myRecipes.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRecipeId(r.id)}
                            className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm ${
                              selectedRecipeId === r.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            {r.image && (
                              <div
                                className="w-12 h-12 rounded-md bg-center bg-cover bg-no-repeat flex-shrink-0"
                                style={{
                                  backgroundImage: `url("${r.image}")`,
                                }}
                              ></div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-text-light dark:text-text-dark line-clamp-1">
                                {r.title}
                              </p>
                              <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark mt-0.5">
                                {r.timeMinutes} phút ·{' '}
                                {r.difficulty === 'easy'
                                  ? 'Dễ'
                                  : r.difficulty === 'medium'
                                  ? 'Trung bình'
                                  : 'Khó'}{' '}
                                ·{' '}
                                {r.status === 'published'
                                  ? 'Đã duyệt'
                                  : r.status === 'pending_review'
                                  ? 'Chờ duyệt'
                                  : r.status === 'rejected'
                                  ? 'Bị từ chối'
                                  : 'Nháp'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    {selectedRecipeId
                      ? 'Một công thức đã được chọn. Khi đăng bài sẽ gắn theo.'
                      : 'Chưa chọn công thức nào.'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecipeId(null);
                        setAttachModalOpen(false);
                      }}
                      className="px-3 py-1 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Bỏ gắn
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachModalOpen(false)}
                      className="px-3 py-1 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right column: Sidebar topics */}
          <aside className="mt-4 lg:mt-0 lg:pl-4 flex flex-col gap-4">
            <div className="rounded-xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
              <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-3">
                Chủ đề gợi ý
              </h3>

              {/* Vùng miền */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2">
                  Theo vùng miền
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Mọi miền', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên']
                    .filter((region) => region === 'Mọi miền' || hasTag(region))
                    .map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => goToSearchWith({ region: region === 'Mọi miền' ? '' : region })}
                        className="px-3 py-1 rounded-full bg-background-light dark:bg-white/5 text-xs text-text-light dark:text-text-dark hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {region}
                      </button>
                    ))}
                </div>
              </div>

              {/* Bữa ăn */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2">
                  Theo bữa ăn
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Ăn sáng', 'Ăn trưa', 'Ăn tối', 'Ăn xế', 'Healthy']
                    .filter((tag) => hasTag(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => goToSearchWith({ tag })}
                        className="px-3 py-1 rounded-full bg-background-light dark:bg-white/5 text-xs text-text-light dark:text-text-dark hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>

              {/* Loại món */}
              <div>
                <p className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark mb-2">
                  Theo loại món
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Món bún',
                    'Món phở',
                    'Món cơm',
                    'Món lẩu',
                    'Món nhậu',
                    'Món chay',
                    'Tráng miệng',
                  ]
                    .filter((tag) => hasTag(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => goToSearchWith({ tag })}
                        className="px-3 py-1 rounded-full bg-background-light dark:bg-white/5 text-xs text-text-light dark:text-text-dark hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

export default FeedPage;
