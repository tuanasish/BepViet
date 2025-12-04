import React, { useEffect, useState } from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGetMyCollections, apiUnsaveRecipe, RecipeListItem } from '../../api';
import { isLoggedIn } from '../../auth';

const CollectionPage: React.FC = () => {
  const [allRecipes, setAllRecipes] = useState<RecipeListItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'timeAsc' | 'timeDesc'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const getDifficultyColorClass = (difficulty: RecipeListItem['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const loadCollections = async () => {
    if (!isLoggedIn()) {
      setRecipes([]);
      setError('Bạn cần đăng nhập để xem bộ sưu tập.');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const data = await apiGetMyCollections();
      setAllRecipes(data);
      setRecipes(data);
    } catch (err: any) {
      setError(err.message || 'Không tải được bộ sưu tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setShowSortDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    if (showSortDropdown || showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSortDropdown, showCategoryDropdown]);

  // Filter và sort recipes
  useEffect(() => {
    let filtered = [...allRecipes];

    // Filter theo category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((recipe) => recipe.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // Giữ nguyên thứ tự từ API (mới nhất trước)
        break;
      case 'oldest':
        filtered = filtered.reverse();
        break;
      case 'timeAsc':
        filtered = filtered.sort((a, b) => a.timeMinutes - b.timeMinutes);
        break;
      case 'timeDesc':
        filtered = filtered.sort((a, b) => b.timeMinutes - a.timeMinutes);
        break;
    }

    setRecipes(filtered);
  }, [allRecipes, sortBy, categoryFilter]);

  // Lấy danh sách categories từ recipes
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    allRecipes.forEach((recipe) => {
      if (recipe.category) {
        cats.add(recipe.category);
      }
    });
    return Array.from(cats).sort();
  }, [allRecipes]);

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest':
        return 'Mới nhất';
      case 'oldest':
        return 'Cũ nhất';
      case 'timeAsc':
        return 'Thời gian: Tăng dần';
      case 'timeDesc':
        return 'Thời gian: Giảm dần';
      default:
        return 'Mới nhất';
    }
  };

  return (
    <>
      <TopNavBar />
      <main class="flex-grow">
        <div class="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          <div class="flex flex-col gap-6">
            {/* PageHeading */}
            <div class="flex flex-wrap justify-between gap-4 items-center">
              <div class="flex flex-col gap-2">
                <h1 class="text-3xl md:text-4xl font-black tracking-tighter text-text-light dark:text-text-dark">Bộ sưu tập của bạn</h1>
                <p class="text-base text-text-muted-light dark:text-text-muted-dark">Những công thức bạn đã lưu để nấu lại sau này.</p>
              </div>
            </div>
            {/* Toolbar & Chips */}
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex gap-3 flex-wrap relative filter-dropdown-container">
                {/* Sort Dropdown */}
                <div class="relative">
                  <button
                    onClick={() => {
                      setShowSortDropdown(!showSortDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark px-4 shadow-sm hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                  >
                    <p class="text-sm font-medium text-text-light dark:text-text-dark">Sắp xếp theo: {getSortLabel()}</p>
                    <span class="material-symbols-outlined text-base">expand_more</span>
                  </button>
                  {showSortDropdown && (
                    <div class="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg min-w-[200px]">
                      <button
                        onClick={() => {
                          setSortBy('newest');
                          setShowSortDropdown(false);
                        }}
                        class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          sortBy === 'newest' ? 'bg-primary/10 text-primary' : 'text-text-light dark:text-text-dark'
                        }`}
                      >
                        Mới nhất
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('oldest');
                          setShowSortDropdown(false);
                        }}
                        class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          sortBy === 'oldest' ? 'bg-primary/10 text-primary' : 'text-text-light dark:text-text-dark'
                        }`}
                      >
                        Cũ nhất
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('timeAsc');
                          setShowSortDropdown(false);
                        }}
                        class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          sortBy === 'timeAsc' ? 'bg-primary/10 text-primary' : 'text-text-light dark:text-text-dark'
                        }`}
                      >
                        Thời gian: Tăng dần
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('timeDesc');
                          setShowSortDropdown(false);
                        }}
                        class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          sortBy === 'timeDesc' ? 'bg-primary/10 text-primary' : 'text-text-light dark:text-text-dark'
                        }`}
                      >
                        Thời gian: Giảm dần
                      </button>
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
                <div class="relative">
                  <button
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowSortDropdown(false);
                    }}
                    class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark px-4 shadow-sm hover:bg-border-light dark:hover:bg-border-dark transition-colors"
                  >
                    <p class="text-sm font-medium text-text-light dark:text-text-dark">
                      Loại món: {categoryFilter === 'all' ? 'Tất cả' : categoryFilter}
                    </p>
                    <span class="material-symbols-outlined text-base">expand_more</span>
                  </button>
                  {showCategoryDropdown && (
                    <div class="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto">
                      <button
                        onClick={() => {
                          setCategoryFilter('all');
                          setShowCategoryDropdown(false);
                        }}
                        class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          categoryFilter === 'all' ? 'bg-primary/10 text-primary' : 'text-text-light dark:text-text-dark'
                        }`}
                      >
                        Tất cả
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setCategoryFilter(cat);
                            setShowCategoryDropdown(false);
                          }}
                          class={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                            categoryFilter === cat ? 'bg-primary/10 text-primary' : 'text-text-light dark:text-text-dark'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* ImageGrid */}
            {error && (
              <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {loading && (
              <p class="text-sm text-text-muted-light dark:text-text-muted-dark">
                Đang tải bộ sưu tập...
              </p>
            )}
            {!loading && allRecipes.length === 0 && !error && (
              <p class="text-sm text-text-muted-light dark:text-text-muted-dark">
                Bạn chưa lưu công thức nào.
              </p>
            )}
            {!loading && allRecipes.length > 0 && recipes.length === 0 && (
              <p class="text-sm text-text-muted-light dark:text-text-muted-dark">
                Không tìm thấy công thức nào với bộ lọc hiện tại.
              </p>
            )}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  class="flex flex-col group bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div class="relative">
                    <div
                      class="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover"
                      style={{ backgroundImage: `url("${recipe.image || ''}")` }}
                    ></div>
                    <button
                      class="absolute top-3 right-3 flex items-center justify-center size-8 rounded-full bg-primary/90 text-white"
                      type="button"
                      onClick={async () => {
                        try {
                          await apiUnsaveRecipe(String(recipe.id));
                          toast.success('Đã bỏ lưu công thức');
                          setAllRecipes((prev) =>
                            prev.filter((r) => r.id !== recipe.id)
                          );
                        } catch (err: any) {
                          toast.error(err.message || 'Không thể bỏ lưu công thức');
                        }
                      }}
                    >
                      <span
                        class="material-symbols-outlined !text-xl"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                      >
                        bookmark_remove
                      </span>
                    </button>
                  </div>
                  <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-base font-bold leading-normal mb-2 flex-grow text-text-light dark:text-text-dark">
                      {recipe.title}
                    </h3>
                    <div class="flex items-center gap-4 text-text-muted-light dark:text-text-muted-dark text-sm mb-3">
                      <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined !text-base">timer</span>
                        <span>{recipe.timeMinutes} phút</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span
                          class={`inline-block size-2 rounded-full ${getDifficultyColorClass(
                            recipe.difficulty
                          )}`}
                        ></span>
                        <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                    <Link
                      to={`/recipe/${recipe.slug}`}
                      class="w-full text-center rounded-lg h-9 px-4 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors flex items-center justify-center"
                    >
                      <span class="truncate">Xem chi tiết</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CollectionPage;


