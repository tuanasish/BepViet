import React from 'react';
import TopNavBar from '../../components/TopNavBar';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  return (
    <>
      <TopNavBar />
      <main class="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
        <div class="layout-content-container flex flex-col w-full max-w-5xl flex-1 gap-6">
          <div class="flex p-4 @container bg-white dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
            <div class="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
              <div class="flex items-center gap-6">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBO36vIOR1IJDK-PRHjx2jaolH-iPg5x4CZ9-GMkn__VyYQFHgCI3sYhyxy8-4jss3muANv0pDFPgW1O0g6n_3wdn8-MA-8o-2mJElxSMhbTHcvauH3quwCpu55VtkM-GnRtL0uwiBltLFOSFqhK1ZV40H4ABoymfxgWkxJ2eN_tBfywIw9rn9E4MQm61E_h7ImDoblpU7dQtANBRAJNyEehpbyax4XtHOG3NrpilMu5Tri_uaMZiMpRphfj_2996HXJKZcN5VQrc")'}}></div>
                <div class="flex flex-col justify-center">
                  <p class="text-text-light dark:text-text-dark text-2xl font-bold leading-tight tracking-[-0.015em]">Van Nguyen</p>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">van.nguyen@bepviet.com</p>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal mt-1">Tham gia từ 24 tháng 4, 2023</p>
                </div>
              </div>
              <div class="flex w-full max-w-[480px] gap-3 @[480px]:w-auto">
                <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors border border-border-light dark:border-border-dark">
                  <span class="truncate">Chỉnh sửa profile</span>
                </button>
                <Link to="/" class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto hover:opacity-90 transition-opacity">
                  <span class="truncate">Đăng xuất</span>
                </Link>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-3 bg-white dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
            <div class="flex flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start">
              <p class="text-text-light dark:text-text-dark tracking-light text-3xl font-bold leading-tight">42</p>
              <div class="flex items-center gap-2">
                <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Bài viết đã đăng</p>
              </div>
            </div>
            <div class="flex flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-border-light dark:border-border-dark p-4 items-start">
              <p class="text-text-light dark:text-text-dark tracking-light text-3xl font-bold leading-tight">115</p>
              <div class="flex items-center gap-2">
                <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Công thức đã lưu</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col bg-white dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
            <div class="pb-3 pt-2">
              <div class="flex border-b border-border-light dark:border-border-dark px-4 gap-8">
                <a class="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-[13px] pt-4 cursor-pointer">
                  <p class="text-sm font-bold leading-normal tracking-[0.015em]">Bài viết của bạn</p>
                </a>
                <a class="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-muted-light dark:text-text-muted-dark pb-[13px] pt-4 hover:text-primary dark:hover:text-primary/90 transition-colors cursor-pointer">
                  <p class="text-sm font-bold leading-normal tracking-[0.015em]">Công thức đã lưu</p>
                </a>
              </div>
            </div>
            <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-6 gap-y-8 p-4 md:p-6">
                {[
                    { title: "Phở Bò Hà Nội Gia Truyền", desc: "Công thức gia truyền từ bà ngoại, đậm đà hương vị...", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8Wd1R2wDWIm6tQiMdU7HBjAgmS16LKigjT34HirdWlQHmY1kRKVcHPsMR6xs3BcO1M2KLR10qZ-OEw6trOReGiANkcQo--zANdBrUuIDSEd87FzY1iTdG1n4CyHBt_HiiL58K6myGjowEnMamzu3m10bKRWKi1nqfRcKxhQshWEtevgY-7dTITvuk5U9bn2GCErHG2Wby7Z_U4AL0o-meNtmffTyMG5W83j_EvXlbjeA3NKpxAdNYQAcA0TkAers0X0hBtzFch7s" },
                    { title: "Bánh Xèo Miền Tây Giòn Rụm", desc: "Bí quyết pha bột để bánh giòn lâu, không ngấm dầu...", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4wbwdEfn65LDyCGubTXWBydAB_O8BnDJRj6j2miBSvLbMI_jj5ZGLv5kuMGVYTOMJW7sTSYgT8wq9E0ZFZyGmPNHZOs1SswFl99-qhzyEEhy76aegNpn6YB4IZCneuKME93Ve48pfLT7Nz1eT6YX4OziumbY_GjFdwhhlqyOFAYOnrfzvcrGSq3r-A8upnibuiSJzShk_Fbd7oK_QtIodyPVyHmfZGZf-_3hmks7FcfYkGQfbfThpuEsaxCSjcS8fwrFG6xHB6pM" },
                    { title: "Gỏi Cuốn Tôm Thịt Chấm Tương Đen", desc: "Cách làm nước chấm tương đen sánh mịn, ngon tuyệt...", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuXPw2waPMIf8_iZI37R0CJdkQWAcyhgmcYl_6k52QKMjgMcvw34tB1MfiXhnkEYfC63yX0Dt8-gdDIykkU77nTURBMdMQ2ZvLWoFAYsHWaKBvGj5-y4IEFs6HweiqAWe4-aHaLyBLqnN-oSfC5ZD88aZ8uWwK8wJKJJC5u387i7p8SLIQRV-tYAZkTDHt-R3St0bBPMg6RIUZ2y3j45Dd3aq15Y5_PMwdS8vRsm5Fi9TTc1gpjjcsLwwHfWQqX33qGBOinThEWpY" },
                    { title: "Bún Bò Huế Chuẩn Vị", desc: "Nước dùng cay nồng, đậm vị sả và mắm ruốc...", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqdrT6spuLJFVZx4KAWGecm8KgOkI5EwcmtqVYZJliqZqGa2zm8C102By0tRAMuFctSX7EoA3dcnhw6VbJ44CwMKNa-eLAqw4L8jozeJcjdHisY61S1CisxmDDNDlcJuMfnj4rg2HLe3LqPK288vvCYoUg_F-GWpKC4tI0eStp7tRWwoWmbsY6w3eCcRpAN-mJOg1lX6Nb80dCwKiVN1IV_SwhNuktcmVnAaPDdqopxUlDrst8QuxH7PVIzaUuyZnMe4TH3mEJ38A" },
                    { title: "Bún Chả Nướng Than Hoa", desc: "Thịt nướng thơm lừng, ăn kèm bún và rau sống...", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD09O7rjSsSBjKCO19eMP3fboLV19uVDZyFDw15tPGn-HF6NJp7ewoy7mD12_buYmZ2tEu9KZ9FVBiyrvN3KmY2u0Rx0fB5n80rf_lNtaeM0CDxhzCoyfrlFQTLYXAiy8jbwnFaiBJfdmMdqx-Ks4Yx2x5qCQGLOX2wmqh79qjyXMonky8s2DCa2IMBJPhE_TqGvZhTTrRxUbTauU3OsOZAfzowX3r8yYN0jYv2AakOgpwzJnOuR8SKcqrowxcfKHcnDhnytUFEujo" },
                    { title: "Xôi Xoài Kiểu Thái", desc: "Món tráng miệng ngọt ngào, kết hợp xôi dẻo và xoài...", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4CHEUvkANYAVgoS8aB5ufSmCqqJWizejKpPFmUw2Qf-cYhPi5nnkdf5DqFHi6yT50IK-k-w7rGt-A-BhUGekA6PFxwHi8flXol8c6MiIiqYfrtsRquJoBnN7RZifRBzYYK072rNWtkKh7e0RXbFq6wfOSGiTyWQ5LhS0oExcZqEc_hFNwBJDHHuhyQI6nDA83NYo_r0Icim6ZiPSrREnr_zhohJL-zyR8T0Ddph1NrnvY5VWRZAK-ZfCPDpOZ9q-4nbR9SYvmc6g" }
                ].map((post, idx) => (
                    <div key={idx} class="flex flex-col gap-3 pb-3">
                        <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{backgroundImage: `url('${post.img}')`}}></div>
                        <div>
                        <p class="text-text-light dark:text-text-dark text-base font-bold leading-normal">{post.title}</p>
                        <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal mt-1">{post.desc}</p>
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

export default ProfilePage;
