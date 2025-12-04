import React from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link } from 'react-router-dom';

const CollectionPage: React.FC = () => {
  const recipes = [
    { id: 1, title: 'Gà nướng mật ong', time: '30 phút', difficulty: 'Dễ', difficultyColor: 'green', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtlXDuxdm-zwgVczVeWMBuIW8N5AXRJwQagW6jm3rRiJlIorXKrYkxbzxSVqGqNpvT_f83SvKhm6O4k3AZF3IZn9CUNzzA31sHF3JYdAGNm0q0etxUkOcIvpyG5jjmezzYbgdmLXFI_2fOfTA5BMpSlwZKLk6OL2ajldNW74WX7dScvLCJRkxmxRPqwctPH6dBEx3mrDSx_HFQzD-k7QoQSqZRkDurNT9xX2jbo8HC0tTvKvfKrN4jDhvStpFNLDKlZIWRE0yJqJc' },
    { id: 2, title: 'Cá diêu hồng hấp xì dầu', time: '25 phút', difficulty: 'Dễ', difficultyColor: 'green', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5y3u2TyhX-tYwUZAdVUCQc0VQfcP5W7U9rn3OQ5r-lHRThRpFdYXnxrUE07xCOtKpZZ9YGVfR3VDr3YxVcf7VX3TRV6HgmOQDSxpwOkHX_g61BMMKTD7fwki5Te12b1Gl5flT6yJ1JMiR5zOVk1GZl4I-J0tl7iql--wsSBX0aENIJvLujEyKXYbAV_LCY2HT99fN3xvXYIq_AL-rz3sO9RjjIwDr28fnkX7rGE_H9-63dVqEbKuH7Rd9i-es3Dkl69DR2AQ5pTs' },
    { id: 3, title: 'Thịt kho trứng cút', time: '60 phút', difficulty: 'Trung bình', difficultyColor: 'yellow', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPtQd5v1xiI5tv8m39sIdbQTARCS5xN0a5-aGNb4rZe8Wt9WMwV91zeXawTmoNrdnHmL5Ao3NtNGkFXTgU7lMDbW3JRd1VX2wVWiu1fO2dG45oerSA86r_ZO49I45KbUy5y4L2eNeHt5N2XDSyVER8VuTbNI5Fx2WpTZQwI-pv57NTj2GJYjbfbyIujWUV-WTVGU5sy7VGChDeXmevLSFcfHfC8pRewvflwPgJZhXq7S6Inx48Q6amsNfCq8QnVKnS8vrlTRnLnYU' },
    { id: 4, title: 'Canh chua cá lóc', time: '40 phút', difficulty: 'Trung bình', difficultyColor: 'yellow', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARwThftmFwY9L6CgxRIYJzDsKWekULoay1RuEt6-k5adH6ibMuChumGINTS2SPa_u0dwmBYk137uiakQWGBq17j7PpHF9EK2bIvVbKXhsnvD1-nH561wQMsIFdS4h2GJq1OmUvGkkLGZKuZkEjXvCHMQa0abymfG9XOjAHzItdwOMxTZkCDrHNa7ZfzvNvJ-diE6Au6yzI_WIJRWfvuqpG4fj6CdjCGGdSenH1G_BIugVwPNenc2RgF8vTPZKrKW4lGCnKvRtOaFU' },
    { id: 5, title: 'Bò lúc lắc khoai tây chiên', time: '35 phút', difficulty: 'Trung bình', difficultyColor: 'yellow', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOn5nzv_C1DSXy6CdtkNJK2RwYA66Y1xjkoMhvM-7r9ALcJLMr_Cy5h3nT63QeAu8Mn08bx_igSP53d5tli0BQcWEfCzOliqN2TyWLpm1t7tG-aB_GheAlbS4TPDlpolUi0cYGQx9kxXslHDEB8hBUnAZXgYTHnzirkK_HsizA9eGg-iKPn4jNZYJHJuDgZCYVc3dXOlYfqYv43deig0KSKCUyt86i8chZPpDHZoS7cjPjZL4md1EVd7vXK8TpJDqDmN8xhFpnED4' },
    { id: 6, title: 'Sườn xào chua ngọt', time: '45 phút', difficulty: 'Khó', difficultyColor: 'red', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsO_8tXgbzhuPACZ1ruw8K_L97ueQSUKLmOne1CkKjnvxC3xY1Zyt6Qxkr0eTb-MTi4wFZdCD0oeXbh22Wqlk_fT3rInKiy-U_paEMg0pJmUuExAU5qhaxsISrT4nbjjbzYiQu47nwuR4qQVWbHdYnubW9QiP_6wVmjFJ4Devp3qK6_1W0C_Lfq7E3sEB1-i1Wy9yyyOm-8Yo0brSQvz3zmgwUBRcrAmhAg9gcWm0I-ObvA8TDOvrAw9Afxard5D81HkysLfKVDuo' },
  ];

  const getDifficultyColorClass = (color: string) => {
    switch(color) {
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        case 'red': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
  }

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
              <div class="flex gap-3 flex-wrap">
                <button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark px-4 shadow-sm hover:bg-border-light dark:hover:bg-border-dark transition-colors">
                  <p class="text-sm font-medium text-text-light dark:text-text-dark">Sắp xếp theo: Mới nhất</p>
                  <span class="material-symbols-outlined text-base">expand_more</span>
                </button>
                <button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark px-4 shadow-sm hover:bg-border-light dark:hover:bg-border-dark transition-colors">
                  <p class="text-sm font-medium text-text-light dark:text-text-dark">Loại món: Tất cả</p>
                  <span class="material-symbols-outlined text-base">expand_more</span>
                </button>
              </div>
            </div>
            {/* ImageGrid */}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <Link to="/recipe/1" key={recipe.id} class="flex flex-col group bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div class="relative">
                    <div class="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover" style={{backgroundImage: `url("${recipe.image}")`}}></div>
                    <button class="absolute top-3 right-3 flex items-center justify-center size-8 rounded-full bg-primary/90 text-white">
                      <span class="material-symbols-outlined !text-xl" style={{fontVariationSettings: "'FILL' 1, 'wght' 400"}}>bookmark</span>
                    </button>
                  </div>
                  <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-base font-bold leading-normal mb-2 flex-grow text-text-light dark:text-text-dark">{recipe.title}</h3>
                    <div class="flex items-center gap-4 text-text-muted-light dark:text-text-muted-dark text-sm mb-3">
                      <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined !text-base">timer</span>
                        <span>{recipe.time}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class={`inline-block size-2 rounded-full ${getDifficultyColorClass(recipe.difficultyColor)}`}></span>
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                    <button class="w-full text-center rounded-lg h-9 px-4 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-sm font-bold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                      <span class="truncate">Xem chi tiết</span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CollectionPage;
