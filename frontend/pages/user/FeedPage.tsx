import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  FeedPost,
  PostComment,
} from '../../api';
import { getStoredUser, isLoggedIn } from '../../auth';
import { timeAgo } from '../../utils/timeAgo';

type FeedPostWithUI = FeedPost & {
  liked?: boolean;
  isLiking?: boolean;
  isCommenting?: boolean;
};

const FeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedPostId = searchParams.get('postId');
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [posts, setPosts] = useState<FeedPostWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const user = useMemo(() => getStoredUser(), []);
  const loggedIn = isLoggedIn();

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

        // Load feed bình thường
        const feedData = await apiGetFeed();

        if (cancelled) return;

        let finalPosts: FeedPostWithUI[] = feedData as FeedPostWithUI[];

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
  }, [highlightedPostId]);

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
        newPostImageUrl || undefined
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
      <main className="w-full max-w-xl mx-auto px-4 py-8">
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
                  onClick={() => toast('Tính năng đang phát triển', { icon: '🚧' })}
                  className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark"
                >
                  <span className="material-symbols-outlined text-sm">
                    link
                  </span>
                  <span className="text-sm font-medium">Gắn công thức</span>
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
          <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal text-center">
            Bạn có thể chia sẻ món bạn vừa nấu, kèm hình ảnh.
          </p>

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
                  {post.imageUrls?.[0] && (
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                      style={{
                        backgroundImage: `url("${post.imageUrls[0]}")`,
                      }}
                    ></div>
                  )}
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
                      <span className="material-symbols-outlined text-base">
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
        </div>
      </main>
    </>
  );
};

export default FeedPage;
