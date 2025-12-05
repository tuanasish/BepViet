import React, { useEffect, useState } from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGetRecipes, RecipeListItem, RecipeFilters } from '../../api';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filters, setFilters] = useState<RecipeFilters>(() => ({
    q: searchParams.get('q') || '',
    category: '',
    difficulty: undefined,
    region: searchParams.get('region') || '',
    ingredient: '',
    timeMin: undefined,
    timeMax: undefined,
    tag: searchParams.get('tag') || '',
    page: 1,
    limit: 24,
  }));

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);


  const loadRecipes = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiGetRecipes({ ...filters, page });
      setRecipes(data.recipes);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Không tải được danh sách công thức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [page, filters]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleFilterChange = (key: keyof RecipeFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      difficulty: undefined,
      region: '',
      ingredient: '',
      timeMin: undefined,
      timeMax: undefined,
      tag: '',
      page: 1,
      limit: 24,
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.category ||
    filters.difficulty ||
    filters.region ||
    filters.ingredient ||
    filters.timeMin ||
    filters.timeMax ||
    filters.tag;

  const categories = ['Món chính', 'Khai vị', 'Tráng miệng', 'Đồ uống', 'Bánh kẹo', 'Món chay', 'Món nhanh'];
  const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];
  const timeRanges = [
    { label: 'Dưới 30 phút', min: undefined, max: 30 },
    { label: '30 - 60 phút', min: 30, max: 60 },
    { label: 'Trên 60 phút', min: 60, max: undefined },
  ];

  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return 'Độ khó';
    return difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó';
  };

  const getTimeLabel = () => {
    if (filters.timeMin && filters.timeMax) {
      return `${filters.timeMin} - ${filters.timeMax} phút`;
    }
    if (filters.timeMin) {
      return `Trên ${filters.timeMin} phút`;
    }
    if (filters.timeMax) {
      return `Dưới ${filters.timeMax} phút`;
    }
    return 'Thời gian chế biến';
  };


  return (
    <>
      <TopNavBar />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-16">
          <section className="flex flex-col items-center">
            <div className="w-full">
              <h1 className="text-center text-4xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark md:text-5xl">
                Tìm Công Thức
              </h1>
            </div>
            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-2 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="sr-only" htmlFor="search-input">
                  Nhập tên món hoặc nguyên liệu...
                </label>
                <div className="relative flex h-12 w-full items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full items-center justify-center pl-4 text-text-muted-light dark:text-text-muted-dark">
                    <span className="material-symbols-outlined text-2xl">search</span>
                  </div>
                  <input
                    className="h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-white dark:bg-card-dark pl-12 pr-4 text-base font-normal leading-normal text-text-light dark:text-text-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    id="search-input"
                    placeholder="Nhập tên món hoặc nguyên liệu..."
                    value={filters.q || ''}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <button
                  className="flex h-12 w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSearch}
                  disabled={loading}
                  type="button"
                >
                  <span className="truncate">{loading ? 'Đang tìm...' : 'Tìm kiếm'}</span>
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 w-full">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <button
                  className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10 ${
                    filters.category ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowDifficultyDropdown(false);
                    setShowTimeDropdown(false);
                    setShowRegionDropdown(false);
                  }}
                >
                  <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                    {filters.category || 'Loại món'}
                  </p>
                  <span className="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">
                    expand_more
                  </span>
                </button>
                {showCategoryDropdown && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark">
                    <div className="p-2">
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('category', '');
                          setShowCategoryDropdown(false);
                        }}
                      >
                        Tất cả
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                          onClick={() => {
                            handleFilterChange('category', cat);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <button
                  className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10 ${
                    filters.difficulty ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => {
                    setShowDifficultyDropdown(!showDifficultyDropdown);
                    setShowCategoryDropdown(false);
                    setShowTimeDropdown(false);
                    setShowRegionDropdown(false);
                  }}
                >
                  <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                    {getDifficultyLabel(filters.difficulty)}
                  </p>
                  <span className="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">
                    expand_more
                  </span>
                </button>
                {showDifficultyDropdown && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark">
                    <div className="p-2">
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('difficulty', undefined);
                          setShowDifficultyDropdown(false);
                        }}
                      >
                        Tất cả
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('difficulty', 'easy');
                          setShowDifficultyDropdown(false);
                        }}
                      >
                        Dễ
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('difficulty', 'medium');
                          setShowDifficultyDropdown(false);
                        }}
                      >
                        Trung bình
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('difficulty', 'hard');
                          setShowDifficultyDropdown(false);
                        }}
                      >
                        Khó
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Filter */}
              <div className="relative">
                <button
                  className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10 ${
                    filters.timeMin || filters.timeMax ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => {
                    setShowTimeDropdown(!showTimeDropdown);
                    setShowCategoryDropdown(false);
                    setShowDifficultyDropdown(false);
                    setShowRegionDropdown(false);
                  }}
                >
                  <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                    {getTimeLabel()}
                  </p>
                  <span className="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">
                    expand_more
                  </span>
                </button>
                {showTimeDropdown && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark">
                    <div className="p-2">
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('timeMin', undefined);
                          handleFilterChange('timeMax', undefined);
                          setShowTimeDropdown(false);
                        }}
                      >
                        Tất cả
                      </button>
                      {timeRanges.map((range, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                          onClick={() => {
                            handleFilterChange('timeMin', range.min);
                            handleFilterChange('timeMax', range.max);
                            setShowTimeDropdown(false);
                          }}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Region Filter */}
              <div className="relative">
                <button
                  className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10 ${
                    filters.region ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => {
                    setShowRegionDropdown(!showRegionDropdown);
                    setShowCategoryDropdown(false);
                    setShowDifficultyDropdown(false);
                    setShowTimeDropdown(false);
                  }}
                >
                  <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                    {filters.region || 'Vùng miền'}
                  </p>
                  <span className="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">
                    expand_more
                  </span>
                </button>
                {showRegionDropdown && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark">
                    <div className="p-2">
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        onClick={() => {
                          handleFilterChange('region', '');
                          setShowRegionDropdown(false);
                        }}
                      >
                        Tất cả
                      </button>
                      {regions.map((region) => (
                        <button
                          key={region}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                          onClick={() => {
                            handleFilterChange('region', region);
                            setShowRegionDropdown(false);
                          }}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ingredient Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nguyên liệu..."
                  value={filters.ingredient || ''}
                  onChange={(e) => handleFilterChange('ingredient', e.target.value)}
                  className="h-9 px-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-3 pr-3 text-text-muted-light dark:text-text-muted-dark hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  onClick={() => {
                    clearFilters();
                    setTimeout(() => loadRecipes(), 100);
                  }}
                >
                  <span className="material-symbols-outlined text-xl">filter_list_off</span>
                  <p className="text-sm font-medium leading-normal">Xóa bộ lọc</p>
                </button>
              )}
            </div>
          </section>

          <section className="mt-12">
            {error && (
              <div className="mb-4 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            {!loading && total > 0 && (
              <div className="mb-4 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
                Tìm thấy {total} công thức
              </div>
            )}
            {loading ? (
              <div className="text-center py-12 text-text-muted-light dark:text-text-muted-dark">
                Đang tải...
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12 text-text-muted-light dark:text-text-muted-dark">
                Không tìm thấy công thức nào
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {recipes.map((recipe) => (
                    <Link
                      to={`/recipe/${recipe.slug}`}
                      key={recipe.id}
                      className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-card-dark shadow-sm transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transform"
                    >
                      <div className="relative">
                        <div className="aspect-w-4 aspect-h-3 h-48 w-full">
                          <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${recipe.image || ''}')` }}
                          ></div>
                        </div>
                        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-sm transition-colors hover:bg-primary hover:text-white">
                          <span className="material-symbols-outlined">bookmark_add</span>
                        </button>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="text-lg font-bold text-text-light dark:text-text-dark">{recipe.title}</h3>
                        <div className="mt-2 flex items-center gap-4 text-sm text-text-muted-light dark:text-text-muted-dark">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">timer</span>
                            <span>{recipe.timeMinutes} phút</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">signal_cellular_alt</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              recipe.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : recipe.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            }`}>
                              {recipe.difficulty === 'easy'
                                ? 'Dễ'
                                : recipe.difficulty === 'medium'
                                ? 'Trung bình'
                                : 'Khó'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex-1"></div>
                        <button className="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">
                          Xem chi tiết
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default SearchPage;
