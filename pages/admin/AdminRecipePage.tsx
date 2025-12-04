import React from 'react';
import AdminSideBar from '../../components/AdminSideBar';

const AdminRecipePage: React.FC = () => {
    const recipes = [
        { id: 1, name: 'Phở Bò Hà Nội', type: 'Món chính', difficulty: 'Trung bình', time: '120 phút', date: '25/10/2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwG0_W1Tx9zq09iC3Ds2-v6_p4z5uFExAt_ushKOA_vq5Z2S1RCtVSdDV32bNRk81YNturVEPwVtnp1jdcYV9mqcu8bvdY9bMTmK73QE6PysieifX_PhYtpvWC-mbAszY3HqeOgsDcVW6cGGrmspAyrm0EA1uyGyus5rep_mzFWUnjSkxlijketky8AraVgbGbJWnJxwWUgErx6lYGchMQyqhp7fKWxZVvbdV3ktUndkqv_fjLKEXBrNSlGSZ4k4Mg3iaZdDXyhUA', diffColor: 'yellow' },
        { id: 2, name: 'Bún Chả', type: 'Món chính', difficulty: 'Dễ', time: '45 phút', date: '24/10/2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsrqaJkTRxDx3bPJmAYgVC5fEeMY8SgI05MKg7jBC0v3-TZC09i1nJYCQ3Y_w50HxAZJRQNwSDdmF2BJGJo_vXnSZJeByjycwUTZAjvKyIAaKX833NhCUst5TWJCXfPmWxociv8xexcsRx5av1APriVMKKKBoc4wOo-vMJtOWjdoT92v3zzH2ZJ9YSyewsSFu_WGqAfUamHrsfVECl96xTR31KRgkRHYiQG_hy54bw6jhcCI2NvTERqVHZJVZQz47eCCXJqngzK80', diffColor: 'green' },
        { id: 3, name: 'Bánh Xèo Miền Tây', type: 'Món chính', difficulty: 'Khó', time: '60 phút', date: '23/10/2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAccs4gbTZO5XsBjyg42aWOkEWGmaU2N6_2DS1rI0tjIgaFSQ_s9uTwEOf5gN7J7Gu4zIZInGytJYUtFIREmcI4xtXC7WxF2kNhmikCSf9MQNNaVGWVc7AP-v6GBa4Y1MMhmvyiwAdRM6GSDkPGRba38R3yCxAcqA03PPCgQZXphpZ5_OK9M5U_w5F455WfuM2kNA4tg5rNdKv59yAe2YLiY9YfJpCvJHaOpisWWkoDxZmIdH9i5n5K2TfLa1w51rQE-9NuGd8JOWE', diffColor: 'red' },
        { id: 4, name: 'Gỏi Cuốn Tôm Thịt', type: 'Món khai vị', difficulty: 'Dễ', time: '30 phút', date: '22/10/2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA012-578yxUABIMjMWFsKgV5O4eBFNPyTRcPfzHbnNkRIeGmF-Hrgf004a_Yoy9kkAZRdqmvITiXzJxPAiE_kB3BEOWwC5rjTkDCPPXOxuOQv2LAbCh7amsNZkyI3i05Pscl22HkDtpECqE_2HZPwZnOHLS4UQXnpkiOFQ0gXCDsCyCNjwsXSdsRcMkcXa1FwBZo46tqA-bwmcsxZSyUV6aObIOJIjlaQ1GOV91lP8HQnCeOL-Jep2lpWBxpE7NumCgu990QIAQYc', diffColor: 'green' },
        { id: 5, name: 'Chè Trôi Nước', type: 'Tráng miệng', difficulty: 'Trung bình', time: '50 phút', date: '21/10/2023', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqNdAf-teDp9KBCkAV54x3tdCWf03EeNcUeDgOXF0C0fY_t1EmGHSx8jdrnGMpvsEVIORoosDQNx8CJPNFxBCTQRrolACUhl4J3cgPNNHaBl9ro_DL5l40quMoEulG75GL6XWppJr2OeTouMcqfSoGAfmothRICBggK9L0B0R5hk0LpGMnW2PxRFug8llYIKvPczZY8Xp586gu0U75BupG_06lcr60ZtdE4fXv9QTWqNvaAfpv-wgWPBuVhCiGguvmFD_Uz0e19ss', diffColor: 'yellow' },
    ];

    const getDifficultyBadge = (difficulty: string, color: string) => {
        let classes = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ";
        if (color === 'green') classes += "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
        else if (color === 'yellow') classes += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
        else if (color === 'red') classes += "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
        
        return <span class={classes}>{difficulty}</span>;
    }

  return (
    <div class="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main class="flex-1 p-8 overflow-y-auto">
        <div class="flex flex-col max-w-full flex-1">
          {/* PageHeading */}
          <div class="flex flex-wrap justify-between gap-4 items-center mb-6">
            <h1 class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight">Quản lý công thức</h1>
            <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined">add</span>
              <span class="truncate">Thêm công thức mới</span>
            </button>
          </div>
          {/* Table container */}
          <div class="flex flex-col bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            {/* Table */}
            <div class="w-full overflow-x-auto">
              <table class="w-full whitespace-nowrap">
                <thead>
                  <tr class="border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5">
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark w-20 text-xs font-medium uppercase tracking-wider">Ảnh</th>
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[200px] text-xs font-medium uppercase tracking-wider">Tên món</th>
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">Loại món</th>
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[100px] text-xs font-medium uppercase tracking-wider">Độ khó</th>
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">Thời gian nấu</th>
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[120px] text-xs font-medium uppercase tracking-wider">Ngày tạo</th>
                    <th class="px-4 py-3 text-left text-text-muted-light dark:text-text-muted-dark min-w-[100px] text-xs font-medium uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-light dark:divide-border-dark">
                    {recipes.map(recipe => (
                        <tr key={recipe.id}>
                            <td class="h-[72px] px-4 py-2 w-20 text-sm font-normal leading-normal">
                            <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-10" style={{backgroundImage: `url("${recipe.image}")`}}></div>
                            </td>
                            <td class="h-[72px] px-4 py-2 min-w-[200px] text-text-light dark:text-text-dark text-sm font-medium leading-normal">{recipe.name}</td>
                            <td class="h-[72px] px-4 py-2 min-w-[120px] text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">{recipe.type}</td>
                            <td class="h-[72px] px-4 py-2 min-w-[100px] text-sm font-normal leading-normal">
                                {getDifficultyBadge(recipe.difficulty, recipe.diffColor)}
                            </td>
                            <td class="h-[72px] px-4 py-2 min-w-[120px] text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">{recipe.time}</td>
                            <td class="h-[72px] px-4 py-2 min-w-[120px] text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">{recipe.date}</td>
                            <td class="h-[72px] px-4 py-2 min-w-[100px] text-text-muted-light dark:text-text-muted-dark text-sm font-bold leading-normal">
                            <div class="flex items-center gap-2">
                                <button class="flex size-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"><span class="material-symbols-outlined text-base">edit</span></button>
                                <button class="flex size-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"><span class="material-symbols-outlined text-base">delete</span></button>
                            </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div class="flex items-center justify-between p-4 border-t border-border-light dark:border-border-dark">
                <p class="text-sm text-text-muted-light dark:text-text-muted-dark">Showing <span class="font-medium text-text-light dark:text-text-dark">1</span> to <span class="font-medium text-text-light dark:text-text-dark">5</span> of <span class="font-medium text-text-light dark:text-text-dark">97</span> results</p>
                <nav class="flex items-center justify-center gap-1">
                <a class="flex size-9 items-center justify-center rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <span class="material-symbols-outlined text-xl">chevron_left</span>
                </a>
                <a class="text-sm font-bold leading-normal flex size-9 items-center justify-center text-white bg-primary rounded-lg cursor-pointer">1</a>
                <a class="text-sm font-medium leading-normal flex size-9 items-center justify-center text-text-light dark:text-text-dark rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">2</a>
                <a class="text-sm font-medium leading-normal flex size-9 items-center justify-center text-text-light dark:text-text-dark rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">3</a>
                <span class="text-sm font-normal leading-normal flex size-9 items-center justify-center text-text-muted-light dark:text-text-muted-dark rounded-lg">...</span>
                <a class="text-sm font-medium leading-normal flex size-9 items-center justify-center text-text-light dark:text-text-dark rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">10</a>
                <a class="flex size-9 items-center justify-center rounded-lg text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                    <span class="material-symbols-outlined text-xl">chevron_right</span>
                </a>
                </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRecipePage;
