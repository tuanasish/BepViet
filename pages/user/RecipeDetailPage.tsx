import React from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link } from 'react-router-dom';

const RecipeDetailPage: React.FC = () => {
  return (
    <>
      <TopNavBar />
      <main class="flex flex-1 justify-center py-5 sm:py-10 px-4">
        <div class="layout-content-container flex flex-col w-full max-w-5xl flex-1">
          {/* Breadcrumbs */}
          <div class="flex flex-wrap gap-2 px-4 mb-4">
            <Link class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal hover:underline" to="/feed">Trang chủ</Link>
            <span class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal">/</span>
            <Link class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal hover:underline" to="/search">Món chính</Link>
            <span class="text-text-muted-light dark:text-text-muted-dark text-sm font-medium leading-normal">/</span>
            <span class="text-text-light dark:text-text-dark text-sm font-medium leading-normal">Phở Bò Hà Nội</span>
          </div>
          {/* HeaderImage */}
          <div class="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-[400px]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuARXrz8aRjp_UGjEDBcMaYIwiU-26nr10jCKUtOH9F-P44eoVMk37Kytkw1sqNUOZ1VvXMNpIJJqUPPDOqKkGhSa0pv7hDpl9_SQ6Nzshoy_uMaQOpXsnebyM8XztjkcEs2xHYOpsShmYEmn1sHVrXYeOrAWTwSzmmHi3nH5rApdKMRcZcDZP2AldKSDSYmNKnGkqInk2Vg_QZQP_U-SLkKXVidqieyf3Oo2R1ydAOaUZvwAWHJMvX15krCwr4ll8A8Es69-nl_XAg")'}}></div>
          {/* Main Content Grid */}
          <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-8">
            {/* Left Column: Details & Steps */}
            <div class="lg:col-span-2">
              {/* PageHeading */}
              <div class="flex flex-wrap justify-between gap-3 p-4">
                <h1 class="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Phở Bò Hà Nội</h1>
              </div>
              {/* ProfileHeader */}
              <div class="flex p-4 @container border-b border-border-light dark:border-border-dark pb-6">
                <div class="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                  <div class="flex gap-4 items-center">
                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDFxSy9Si2INsOkVLK2CrrFX-nI3JbFARKIco2wa-NQZ3BMuE0FrhlK8pY3UJK3s-SbuWfPBqPIRtSay6oXPZR4x26YCQhkGcxnbUOZ4xOzYGzl7WQOrLB2PGArFoDj4wBMRpru5s7pBG5eM4KSHq1F6hvcWXnf2lkyQjgsfMAeNG6UTYLSo8A5FqjJLjc__JcqP94PjCSQqAPTm-j62QAzndXBM06WvKDIdkFk_zWU7HaeXuugZx5gxLWGbEBveoMV98jcz4hLLdI")'}}></div>
                    <div class="flex flex-col justify-center">
                      <p class="text-text-light dark:text-text-dark text-base font-bold leading-tight tracking-[-0.015em]">Đăng bởi Helen</p>
                      <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Chuyên gia ẩm thực</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Info Badges */}
              <div class="flex flex-wrap gap-4 p-4 mt-4">
                <div class="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2 text-sm font-medium text-primary dark:text-primary">
                  <span class="material-symbols-outlined !text-base">timer</span>
                  <span>Thời gian: 120 phút</span>
                </div>
                <div class="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2 text-sm font-medium text-primary dark:text-primary">
                  <span class="material-symbols-outlined !text-base">leaderboard</span>
                  <span>Độ khó: Trung bình</span>
                </div>
                <div class="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2 text-sm font-medium text-primary dark:text-primary">
                  <span class="material-symbols-outlined !text-base">restaurant_menu</span>
                  <span>Món chính</span>
                </div>
              </div>
              {/* Description */}
              <div class="p-4 mt-2">
                <p class="text-[#333] dark:text-gray-300 text-base leading-relaxed">Phở bò Hà Nội là tinh hoa ẩm thực của thủ đô, một món ăn không chỉ ngon miệng mà còn chứa đựng cả một nền văn hóa. Nước dùng trong, ngọt thanh từ xương, thơm lừng mùi quế, hồi, thảo quả quyện cùng vị mềm của bánh phở và thịt bò thái mỏng. Thưởng thức một bát phở nóng hổi vào buổi sáng là một trải nghiệm tuyệt vời.</p>
              </div>
              {/* Steps Section */}
              <div class="p-4 mt-6">
                <h2 class="text-2xl font-bold text-text-light dark:text-text-dark mb-6">Các bước thực hiện</h2>
                <ol class="space-y-8">
                  <li class="flex gap-4">
                    <div class="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">1</div>
                    <p class="text-base text-[#333] dark:text-gray-300 leading-relaxed">Sơ chế xương bò: Rửa sạch xương ống, chần qua nước sôi để loại bỏ tạp chất. Vớt ra rửa lại với nước lạnh. Nướng gừng và hành khô cho thơm. Cho xương, gừng, hành nướng vào nồi lớn, đổ ngập nước và bắt đầu hầm.</p>
                  </li>
                  <li class="flex gap-4">
                    <div class="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">2</div>
                    <p class="text-base text-[#333] dark:text-gray-300 leading-relaxed">Nấu nước dùng: Cho túi gia vị phở (quế, hồi, thảo quả, đinh hương, hạt mùi) đã rang thơm vào nồi nước hầm. Hầm ở lửa nhỏ trong ít nhất 2-3 tiếng, thường xuyên hớt bọt để nước dùng được trong. Nêm nếm gia vị vừa ăn.</p>
                  </li>
                  <li class="flex gap-4">
                    <div class="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">3</div>
                    <p class="text-base text-[#333] dark:text-gray-300 leading-relaxed">Chuẩn bị thịt và rau thơm: Thịt bò thăn thái lát thật mỏng. Hành lá, ngò gai thái nhỏ. Hành tây thái mỏng. Chần bánh phở qua nước sôi rồi cho vào tô.</p>
                  </li>
                  <li class="flex gap-4">
                    <div class="flex-shrink-0 flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">4</div>
                    <p class="text-base text-[#333] dark:text-gray-300 leading-relaxed">Hoàn thành: Xếp thịt bò thái mỏng lên trên bánh phở, rắc hành lá, ngò gai, hành tây. Chan nước dùng đang sôi sùng sục vào tô. Thưởng thức ngay khi còn nóng cùng với chanh, ớt và giá đỗ.</p>
                  </li>
                </ol>
              </div>
            </div>
            {/* Right Column: Ingredients & Actions */}
            <div class="lg:col-span-1 mt-8 lg:mt-0">
              <div class="sticky top-20 bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                <h3 class="text-xl font-bold text-text-light dark:text-text-dark mb-5">Nguyên liệu</h3>
                <ul class="space-y-3 text-[#333] dark:text-gray-300 text-base">
                  <li class="flex items-center gap-3">
                    <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient1" type="checkbox" />
                    <label htmlFor="ingredient1">1kg xương ống bò</label>
                  </li>
                  <li class="flex items-center gap-3">
                    <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient2" type="checkbox" />
                    <label htmlFor="ingredient2">500g thịt bò thăn hoặc nạm</label>
                  </li>
                  <li class="flex items-center gap-3">
                    <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient3" type="checkbox" />
                    <label htmlFor="ingredient3">1kg bánh phở tươi</label>
                  </li>
                  <li class="flex items-center gap-3">
                    <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient4" type="checkbox" />
                    <label htmlFor="ingredient4">2 củ hành tây</label>
                  </li>
                  <li class="flex items-center gap-3">
                     <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient5" type="checkbox" />
                    <label htmlFor="ingredient5">1 củ gừng</label>
                  </li>
                  <li class="flex items-center gap-3">
                    <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient6" type="checkbox" />
                    <label htmlFor="ingredient6">1 túi gia vị nấu phở</label>
                  </li>
                  <li class="flex items-center gap-3">
                     <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient7" type="checkbox" />
                    <label htmlFor="ingredient7">Hành lá, ngò gai, rau húng quế</label>
                  </li>
                  <li class="flex items-center gap-3">
                    <input class="form-checkbox rounded text-primary focus:ring-primary" id="ingredient8" type="checkbox" />
                    <label htmlFor="ingredient8">Gia vị: Nước mắm, muối, đường, hạt nêm</label>
                  </li>
                </ul>
                <div class="mt-8 flex flex-col gap-3">
                  <button class="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                    <span class="material-symbols-outlined !text-xl">bookmark_add</span>
                    <span class="truncate">Lưu vào bộ sưu tập</span>
                  </button>
                  <Link class="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-gray-100 dark:bg-white/10 text-text-light dark:text-text-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" to="/collection">
                    <span class="material-symbols-outlined !text-xl">arrow_back</span>
                    <span class="truncate">Quay lại</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default RecipeDetailPage;
