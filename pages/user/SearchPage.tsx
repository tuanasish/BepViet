import React from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link } from 'react-router-dom';

const SearchPage: React.FC = () => {
    const recipes = [
        { id: 1, title: 'Salad Trộn Dầu Giấm', time: '15 phút', difficulty: 'Dễ', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRvu34pXDo6_lWDLbEdaFrdmtO_EymoQYrdmN3_HNkz3f3dUGB51up9KBUIe6LSeIttqchU4JyaoztNq8fS7z2iWxoJmTPGfBB0j9_yTGNAKgXnQ7yF6986sCzUj4eJmHWKrhsHKeBhOQTB7oi8r6swtdw2KrGB_u0WEBziJDontdyOejPqC5K7etwXP9a4CQ0ElqcE2v-_IsXcAtH8Q5rgjgNgab8c4msgJp626TyFqgCdFWdoBpXmnHYvpzRciTXGjWeppTLu2g' },
        { id: 2, title: 'Pizza Hải Sản', time: '45 phút', difficulty: 'Trung bình', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsqIAJgzQcFWNLFpRu8y3lUsMctlVHvKFYO75uGLY-595DtbDnB_-aGHbf5l8LfFJDr3BBqF8IrIdZS8lL7Jp00In_87dYQpqBbBQXss48vOWlMnzjiPhYYHYpf3fM8yhz3FqWT0zbjnVX0_ze9e9yqvUyHWylvivBwa1S-_Kr3Aaxi2d9AK2AaLYCxxl13tVPmGZizs93583dn9Jhgf0Xp9em-5WkMfYc4kxoKPL71lv6Kv5cPgThkC_MKHgav6sFguTy92JfPT0' },
        { id: 3, title: 'Gà Nướng Mật Ong', time: '1 giờ', difficulty: 'Trung bình', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoJlWRxo2TAgOpDW_6wxG2NE5SdtBy7DbwEuAPZz4S7mDjECYltXrhoAFyfu0fqAOq1c6N3_hlZH7tir1zlDaZRpkSAjmHGXFtv8O5gIoCorAm-kWp3Hdk75O8u-ElZpmWluptx4J9PbhL_LyXxaSsuiWL4xLlVbLe8dKlR_rLBBlz0AHYGukMVFGb0-lwH1efbyFfLTqe99m-lg2A1ktOIKqc1ez26yzR8B7KJT1x2ugaCtUvzXVyO3w0rtLaf0l-8GL_taTkaG0' },
        { id: 4, title: 'Mì Ý Sốt Bò Bằm', time: '30 phút', difficulty: 'Dễ', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVWDU2q9Iu84tFTkM9jarjNbCZZse5dyqih9hpAXzXOyrciL8HAfpGlv55z_42VZO3hUzWjtMGSEOzFJ5ib6xnFuDQB4C-KqcFSBN-fWy-8Uz4u95DiCDqMlhGMitIV8krCgr-yO5l-iaZ0kNGEJD8RLqxJVf9LquWNBLrU1g9iIc8JVZL0LxD52FGKCKWy37flwSVtDMbl_W4i9jKFb2_NZT3ywXdc01HTxFS5IuTX9-WV51hgy5p4LtN3edg3vJJue1TrugM9PQ' }
    ]

  return (
    <>
      <TopNavBar />
      <main class="flex-1">
        <div class="container mx-auto max-w-6xl px-4 py-8 md:py-16">
          <section class="flex flex-col items-center">
            <div class="w-full">
              <h1 class="text-center text-4xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark md:text-5xl">Tìm Công Thức</h1>
            </div>
            <div class="mt-8 grid w-full max-w-3xl grid-cols-1 gap-2 md:grid-cols-3">
              <div class="md:col-span-2">
                <label class="sr-only" htmlFor="search-input">Nhập tên món hoặc nguyên liệu...</label>
                <div class="relative flex h-12 w-full items-center">
                  <div class="pointer-events-none absolute left-0 flex h-full items-center justify-center pl-4 text-text-muted-light dark:text-text-muted-dark">
                    <span class="material-symbols-outlined text-2xl">search</span>
                  </div>
                  <input class="h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-white dark:bg-card-dark pl-12 pr-4 text-base font-normal leading-normal text-text-light dark:text-text-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary" id="search-input" placeholder="Nhập tên món hoặc nguyên liệu..." />
                </div>
              </div>
              <div class="md:col-span-1">
                <button class="flex h-12 w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-primary/90 transition-colors">
                  <span class="truncate">Tìm kiếm</span>
                </button>
              </div>
            </div>
          </section>
          
          <section class="mt-8 w-full">
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10">
                <p class="text-sm font-medium leading-normal text-text-light dark:text-text-dark">Loại món</p>
                <span class="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">expand_more</span>
              </button>
              <button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10">
                <p class="text-sm font-medium leading-normal text-text-light dark:text-text-dark">Độ khó</p>
                <span class="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">expand_more</span>
              </button>
              <button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark pl-4 pr-3 hover:bg-primary/10">
                <p class="text-sm font-medium leading-normal text-text-light dark:text-text-dark">Thời gian nấu</p>
                <span class="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">expand_more</span>
              </button>
              <button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-3 pr-3 text-text-muted-light dark:text-text-muted-dark hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <span class="material-symbols-outlined text-xl">filter_list_off</span>
                <p class="text-sm font-medium leading-normal">Xóa bộ lọc</p>
              </button>
            </div>
          </section>

          <section class="mt-12">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recipes.map(recipe => (
                   <Link to="/recipe/1" key={recipe.id} class="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-card-dark shadow-sm transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transform">
                    <div class="relative">
                      <div class="aspect-w-4 aspect-h-3 h-48 w-full">
                        <div class="h-full w-full bg-cover bg-center" style={{backgroundImage: `url('${recipe.image}')`}}></div>
                      </div>
                      <button class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-sm transition-colors hover:bg-primary hover:text-white">
                        <span class="material-symbols-outlined">bookmark_add</span>
                      </button>
                    </div>
                    <div class="flex flex-1 flex-col p-4">
                      <h3 class="text-lg font-bold text-text-light dark:text-text-dark">{recipe.title}</h3>
                      <div class="mt-2 flex items-center gap-4 text-sm text-text-muted-light dark:text-text-muted-dark">
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-base">timer</span>
                          <span>{recipe.time}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="material-symbols-outlined text-base">signal_cellular_alt</span>
                          <span>{recipe.difficulty}</span>
                        </div>
                      </div>
                      <div class="mt-4 flex-1"></div>
                      <button class="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">
                         Xem chi tiết
                      </button>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default SearchPage;
