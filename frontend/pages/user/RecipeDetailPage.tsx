import React, { useEffect, useState } from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link, useParams } from 'react-router-dom';
import { apiGetRecipeDetail, apiGetAdminRecipeDetail, apiSaveRecipe, apiRateRecipe, RecipeDetail } from '../../api';
import toast from 'react-hot-toast';
import { isLoggedIn, isAdmin } from '../../auth';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        // Thử dùng slug trước (cho user thường)
        try {
          const data = await apiGetRecipeDetail(id);
          setRecipe(data);
        } catch (slugErr: any) {
          // Nếu không tìm thấy bằng slug và user là admin, thử dùng ID
          if (isAdmin()) {
            try {
              const adminData = await apiGetAdminRecipeDetail(id);
              setRecipe(adminData);
            } catch (adminErr: any) {
              throw new Error(adminErr.message || 'Không tìm thấy công thức');
            }
          } else {
            throw slugErr;
          }
        }
      } catch (err: any) {
        setError(err.message || 'Không tải được công thức');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const headerImage = recipe?.images?.[0] ?? '';

  return (
    <>
      <TopNavBar />
      <main class="flex flex-1 justify-center py-5 sm:py-10 px-4">
        <div class="layout-content-container flex flex-col w-full max-w-5xl flex-1">
          {/* Breadcrumbs */}
          <div class="flex flex-wrap gap-2 px-4 mb-4">
            <Link class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal hover:underline" to="/feed">Trang chủ</Link>
            <span class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal">/</span>
            <Link class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal hover:underline" to="/search">Khám phá</Link>
            {recipe && (
              <>
                <span class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal">/</span>
                <span class="text-text-light dark:text-text-dark text-sm font-medium leading-normal">{recipe.title}</span>
              </>
            )}
          </div>

          {loading && (
            <p class="px-4 text-sm text-text-muted-light dark:text-text-muted-dark">
              Đang tải công thức...
            </p>
          )}
          {error && (
            <p class="px-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {!loading && !recipe && !error && (
            <p class="px-4 text-sm text-text-muted-light dark:text-text-muted-dark">
              Không tìm thấy công thức.
            </p>
          )}

          {recipe && (
            <>
              {/* HeaderImage */}
              <div class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-[400px]" style={{backgroundImage: `url('${headerImage}')`}}></div>
              {/* Main Content Grid */}
              <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-8">
                {/* Left Column: Details & Steps */}
                <div class="lg:col-span-2">
                  {/* PageHeading + Rating */}
                  <div class="flex flex-wrap justify-between gap-3 p-4">
                    <div class="flex flex-col gap-2">
                      <h1 class="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                        {recipe.title}
                      </h1>
                      {/* Rating Summary */}
                      {recipe.averageRating !== undefined && recipe.ratingCount !== undefined && (
                        <div class="flex items-center gap-2">
                          <div class="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                class={`material-symbols-outlined text-xl ${
                                  star <= Math.round(recipe.averageRating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              >
                                star
                              </span>
                            ))}
                          </div>
                          <span class="text-text-muted-light dark:text-text-muted-dark text-sm">
                            {recipe.averageRating.toFixed(1)} ({recipe.ratingCount} đánh giá)
                          </span>
                        </div>
                      )}
                      {/* User Rating */}
                      {isLoggedIn() && (
                        <div class="flex items-center gap-2">
                          <span class="text-text-light dark:text-text-dark text-sm">Đánh giá của bạn:</span>
                          <div class="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={async () => {
                                  if (ratingLoading) return;
                                  if (!isLoggedIn()) {
                                    toast.error('Bạn cần đăng nhập để đánh giá');
                                    return;
                                  }
                                  try {
                                    setRatingLoading(true);
                                    const result = await apiRateRecipe(recipe.id, star);
                                    setRecipe({ ...recipe, ratingCount: result.ratingCount, averageRating: result.averageRating });
                                    setUserRating(star);
                                    toast.success('Đã đánh giá công thức');
                                  } catch (err: any) {
                                    toast.error(err.message || 'Không thể đánh giá công thức');
                                  } finally {
                                    setRatingLoading(false);
                                  }
                                }}
                                disabled={ratingLoading}
                                class={`material-symbols-outlined text-xl cursor-pointer transition-colors ${
                                  star <= (userRating || 0)
                                    ? 'text-yellow-400 hover:text-yellow-500'
                                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                                } ${ratingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                star
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* ProfileHeader */}
                  <div class="flex p-4 @container border-b border-border-light dark:border-border-dark pb-6">
                    <div class="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                      <div class="flex gap-4 items-center">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" style={{backgroundImage: `url('${headerImage}')`}}></div>
                        <div class="flex flex-col justify-center">
                          <p class="text-text-light dark:text-text-dark text-base font-bold leading-tight tracking-[-0.015em]">
                            Đăng bởi {recipe.authorName}
                          </p>
                          <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">
                            Công thức từ BepViet
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Info Badges */}
                  <div class="flex flex-wrap gap-4 px-4 mt-2">
                    <div class="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2 text-sm font-medium text-primary dark:text-primary">
                      <span class="material-symbols-outlined !text-base">timer</span>
                      <span>Thời gian: {recipe.timeMinutes} phút</span>
                    </div>
                    <div class={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                      recipe.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : recipe.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      <span class="material-symbols-outlined !text-base">leaderboard</span>
                      <span>Độ khó: {recipe.difficulty === 'easy' ? 'Dễ' : recipe.difficulty === 'medium' ? 'Trung bình' : 'Khó'}</span>
                    </div>
                    <div class="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2 text-sm font-medium text-primary dark:text-primary">
                      <span class="material-symbols-outlined !text-base">restaurant_menu</span>
                      <span>{recipe.category}</span>
                    </div>
                  </div>
                  {/* Rating Section */}
                  <div class="p-4 mt-4 border-b border-border-light dark:border-border-dark pb-6">
                    <div class="flex flex-col gap-3">
                      <div class="flex items-center gap-3">
                        <span class="text-text-light dark:text-text-dark text-base font-bold">Đánh giá:</span>
                        {recipe.averageRating !== undefined && recipe.ratingCount !== undefined && (
                          <div class="flex items-center gap-2">
                            <div class="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  class={`material-symbols-outlined text-xl ${
                                    star <= Math.round(recipe.averageRating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <span class="text-text-muted-light dark:text-text-muted-dark text-sm">
                              {recipe.averageRating.toFixed(1)} ({recipe.ratingCount} đánh giá)
                            </span>
                          </div>
                        )}
                      </div>
                      {isLoggedIn() && (
                        <div class="flex items-center gap-2">
                          <span class="text-text-light dark:text-text-dark text-sm">Đánh giá của bạn:</span>
                          <div class="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={async () => {
                                  if (ratingLoading) return;
                                  if (!isLoggedIn()) {
                                    toast.error('Bạn cần đăng nhập để đánh giá');
                                    return;
                                  }
                                  try {
                                    setRatingLoading(true);
                                    const result = await apiRateRecipe(recipe.id, star);
                                    setRecipe({ ...recipe, ratingCount: result.ratingCount, averageRating: result.averageRating });
                                    setUserRating(star);
                                    toast.success('Đã đánh giá công thức');
                                  } catch (err: any) {
                                    toast.error(err.message || 'Không thể đánh giá công thức');
                                  } finally {
                                    setRatingLoading(false);
                                  }
                                }}
                                disabled={ratingLoading}
                                class={`material-symbols-outlined text-xl cursor-pointer transition-colors ${
                                  star <= (userRating || 0)
                                    ? 'text-yellow-400 hover:text-yellow-500'
                                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                                } ${ratingLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                star
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Description */}
                  {recipe.description && (
                    <div class="p-4 mt-2">
                      <p class="text-[#333] dark:text-gray-300 text-base leading-relaxed">
                        {recipe.description}
                      </p>
                    </div>
                  )}
                  {/* Steps Section */}
                  <div class="p-4 mt-6">
                    <h2 class="text-2xl font-bold text-text-light dark:text-text-dark mb-6">Các bước thực hiện</h2>
                    <ol class="space-y-8">
                      {recipe.steps.map((step) => (
                        <li key={step.order} class="flex flex-col gap-4">
                          <div class="flex gap-4">
                            <div class="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">
                              {step.order}
                            </div>
                            <div class="flex-1">
                              {step.title && (
                                <h3 class="text-lg font-bold text-text-light dark:text-text-dark mb-2">
                                  {step.title}
                                </h3>
                              )}
                              <p class="text-base text-[#333] dark:text-gray-300 leading-relaxed">
                                {step.content}
                              </p>
                            </div>
                          </div>
                          {/* Step Images */}
                          {(step.images && step.images.length > 0) || step.imageUrl ? (
                            <div class="flex flex-wrap gap-4 ml-12">
                              {/* Hiển thị images mảng (ưu tiên) */}
                              {step.images && step.images.length > 0 ? (
                                step.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Bước ${step.order} - Hình ${idx + 1}`}
                                    class="rounded-lg object-cover max-w-full h-auto max-h-96"
                                  />
                                ))
                              ) : (
                                /* Fallback cho imageUrl cũ nếu có */
                                step.imageUrl && (
                                  <img
                                    src={step.imageUrl}
                                    alt={`Bước ${step.order}`}
                                    class="rounded-lg object-cover max-w-full h-auto max-h-96"
                                  />
                                )
                              )}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                {/* Right Column: Ingredients & Actions */}
                <div class="lg:col-span-1 mt-8 lg:mt-0">
                  <div class="sticky top-20 bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                    <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-5">Nguyên liệu</h3>
                    <ul class="space-y-3 text-[#333] dark:text-gray-300 text-base">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} class="flex items-start gap-3">
                          <span class="mt-1 inline-flex size-3 rounded-full bg-primary/80"></span>
                          <span>
                            {ing.amount ? `${ing.amount} ` : ''}{ing.name}{ing.note ? ` (${ing.note})` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div class="mt-8 flex flex-col gap-3">
                      <button
                        class="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                        type="button"
                        onClick={async () => {
                          if (!isLoggedIn()) {
                            toast.error('Bạn cần đăng nhập để lưu công thức');
                            return;
                          }
                          try {
                            await apiSaveRecipe(recipe.id);
                            toast.success('Đã lưu vào bộ sưu tập');
                          } catch (err: any) {
                            toast.error(err.message || 'Không thể lưu công thức');
                          }
                        }}
                      >
                        <span class="material-symbols-outlined !text-xl">bookmark_add</span>
                        <span class="truncate">Lưu vào bộ sưu tập</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default RecipeDetailPage;


