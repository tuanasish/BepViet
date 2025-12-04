import React from 'react';
import TopNavBar from '../../components/TopNavBar';

const FeedPage: React.FC = () => {
  return (
    <>
      <TopNavBar />
      <main class="w-full max-w-xl mx-auto px-4 py-8">
        <div class="flex flex-col gap-6">
          {/* Composer Card */}
          <div class="flex flex-col gap-2 p-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark">
            <div class="flex items-start gap-3">
              <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 mt-1" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgj3Iprg3wlv0Y5cyKYxmpL-0HXbkYtlkxM9Xekg420rJR6C_FI2t6cojwg89j6TRYFxU-me_7D2-OTmiD8kLtS79vQenTxl2AmcEXWqeesI2SnXA1CeJ6ghBH3wFy2l0WsA3dpv-BniHp-i2ut5P8O_fGNq8sjXVqvGxhfoLc2wY8__8y-yXX28RjyoVjQwylqT8T2sKlwx5ZOHTn3BTuotQAEF9ducvK33fJZaclWfmyEEwscojllfr4quFZLF989GSCWUfjbE8")'}}></div>
              <textarea class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-transparent h-24 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark text-base font-normal leading-normal pt-3" placeholder="Hôm nay bạn nấu gì thế?"></textarea>
            </div>
            <div class="flex items-center justify-between pl-14">
              <div class="flex items-center gap-2">
                <button class="flex items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                  <span class="material-symbols-outlined text-sm">image</span>
                  <span class="text-sm font-medium">Chọn ảnh</span>
                </button>
                <button class="flex items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                  <span class="material-symbols-outlined text-sm">link</span>
                  <span class="text-sm font-medium">Gắn công thức</span>
                </button>
              </div>
              <button class="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/90">
                <span class="truncate">Đăng bài</span>
              </button>
            </div>
          </div>
          <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal text-center">Bạn có thể chia sẻ món bạn vừa nấu, kèm hình ảnh.</p>

          {/* Feed Post Card 1 */}
          <div class="flex flex-col gap-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8xba3lY4NQYnWhNgbdK9M2Am-ltwp41RwNcJ3cGIFOZnD3CEOwBvoBHuQsRWyQPRzGcT-Ip1wQdPa1Xg_i2fdLGY2l3EYp30rTTBBFVoawOwau9d17BCzXdgRYKjUg-jXPg_nbcWWnupRyCcKf2xsU7NnVCNljOj2YQJT4DL941unffQ_sfMzYkx8YphEREyxRey24bPhAWsg1-og_8MU8H338q-fc-5st08aePhkKNqkeLQYpZYARrNPrVCtS26OGUdkmBQCGes")'}}></div>
                <div>
                  <p class="text-text-light dark:text-text-dark text-sm font-bold leading-normal">An Nguyễn</p>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-normal leading-normal">5 phút trước</p>
                </div>
              </div>
              <button class="flex items-center justify-center size-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                <span class="material-symbols-outlined text-base">more_horiz</span>
              </button>
            </div>
            <div class="flex flex-col gap-4">
              <p class="text-text-light dark:text-text-dark text-base font-normal leading-relaxed">Mới nấu xong nồi cá kho tộ theo công thức của mẹ, thơm nức mũi cả nhà ạ. Cuối tuần có món này ăn với cơm nóng thì còn gì bằng!</p>
              <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLY2Fkqkg3_S3Yhedly8y-rs0vpWNE_CD2Y87NVkAFVmAyZrxCL_wMZUltwYEsYP_ld2Io_CdRYnfNYQdzqyk8wpteJYy-wC0X2klStArHQhPrsEN6v1eqGwA2SWJtTVCZWN1D4TsOuNhGUJv5vEj4JUz_FoqUOBFGVPoYTF7v4Tb4wTjnaeC_uctKGkujfZpGLRR-PV0bIoPuR_RpxcsTvu1BluEp8AFE3pU1DpnJoKmaUMQLZVVjBUirkAZQSZJh1DN2bnhftto")'}}></div>
            </div>
            {/* Linked Recipe */}
            <div class="flex items-center gap-4 bg-background-light dark:bg-white/5 p-3 rounded-lg border border-border-light dark:border-border-dark">
              <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14 shrink-0" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7O4gx2cgHK7DvmV40AwvHfY3T-FQWefmC2ChJqlUP9r4O0Vd_tSyD_I73twOXlprAw2aBhdcrG9DaaLPter_FxFQ33TW11UwaZxGnH0nNQ21WyDmN3HBR7vcbD9J8oY-Q1L2M006pKBmS9ALW5WHR6jBewWCJodU1a1GSfAxvU43AwQ_Z_ICUxH4xQZjl_vwApSVOy8eG8bHodGzSTuRfyf7NLjC1AmeAlfgixrLohTHO0fKfu1OtnEZ-_p44Hj4H9XsL01_m7xo")'}}></div>
              <div class="flex flex-col justify-center flex-grow">
                <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-medium uppercase tracking-wide">Công thức liên quan</p>
                <p class="text-text-light dark:text-text-dark text-base font-bold leading-normal">Cá kho tộ</p>
                <p class="text-text-muted-light dark:text-text-muted-dark text-sm font-normal leading-normal">Thời gian nấu: 45 phút</p>
              </div>
              <div class="shrink-0">
                <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-4 bg-white dark:bg-white/10 text-text-light dark:text-text-dark text-sm font-medium leading-normal border border-border-light dark:border-border-dark hover:bg-gray-50">
                  <span class="truncate">Xem</span>
                </button>
              </div>
            </div>
            <div class="border-t border-border-light dark:border-border-dark pt-2 flex flex-col gap-2">
              <div class="flex items-center -mx-2">
                <button class="flex flex-1 items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                  <span class="material-symbols-outlined text-base">favorite</span>
                  <span class="text-sm font-medium">Thích</span>
                </button>
                <button class="flex flex-1 items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                  <span class="material-symbols-outlined text-base">chat_bubble</span>
                  <span class="text-sm font-medium">Bình luận</span>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAI_CJHL_hDHHyUVr6K6t6V1pUSk42crM3Ck227NlBNf08wFkvPK2lI6oJN3pBjdZGvGUT_AUfz4ZtN9JVJFXrS2Cmg-UjHMFoM_5d5tYzGyYgx9Kqr2adtOP1bKpGaT8DXamuYsJIFnuahKbVxwDmu6DHQzqqKmtl7c-8fDVJ2qmbGI1dS69tznd7XOsJn2gvQpsUg-0_d8CqiYQTOqOG9Dqy1MUIkcfTMYBD0DMMBBF5F55mo6uIIgxxzTVRP9Y6RNR8CZxhj30I")'}}></div>
                <input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-text-light dark:text-text-dark focus:outline-0 focus:ring-1 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-white/5 h-9 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark px-4 text-sm font-normal leading-normal" placeholder="Viết bình luận..." />
              </div>
            </div>
          </div>

           {/* Feed Post Card 2 */}
           <div class="flex flex-col gap-4 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQN5Sd8JZuNDIfvUlTB_PhDN2GVCcy-HD1s1NVAq20w3HuTltL0ZfqtXLPNSA4ysWg00Gh20V-RF9h81pZIVa4g_AY8sMEThPu1MJv0yLxkSMs6Gx6epxi9XV12BNtgMQe4D9wVS7ubr-ruQTy1eIDhorU0jdCOmewu8vFfmDJVLgCCXnvGUXpecVAlbbvylufW53jsfFI07Sj_DHz1f0VsP55EpXzfkR0LfFh8EdxgrK_4SZ-VLuNWDd06-e02qTinGgS1gPgAE8")'}}></div>
                <div>
                  <p class="text-text-light dark:text-text-dark text-sm font-bold leading-normal">Bao Tran</p>
                  <p class="text-text-muted-light dark:text-text-muted-dark text-xs font-normal leading-normal">1 giờ trước</p>
                </div>
              </div>
              <button class="flex items-center justify-center size-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                <span class="material-symbols-outlined text-base">more_horiz</span>
              </button>
            </div>
            <div class="flex flex-col gap-4">
              <p class="text-text-light dark:text-text-dark text-base font-normal leading-relaxed">Bữa sáng nhanh gọn mà vẫn đủ chất với món trứng ốp la và bánh mì nướng. Chúc cả nhà một ngày mới tốt lành!</p>
              <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA96G7vx_PJTQKXdV7CGrJiYV7PXugCnwghmHPeeG_mLfROa9OvZmI_1XjEFvC78VavXF1uqliFs3LEdJm9EjAinoR8eE-eZgBz9k4dZULQECPoSO4vEc6o8EiGIP26MNCRprjFlU2e0X8OB_kyh_OySmtRECWJIiJUkAuhX-6g4OLx102uSN2J7wgbUkfEO4S2HFQvXoI_43qOwgmbGP7v5dvo_IHVlBEtzFeiDvPJpPfZtvwyPVYRGd0QrnPaUr4DuLtOjez2szY")'}}></div>
            </div>
            <div class="border-t border-border-light dark:border-border-dark pt-2 flex flex-col gap-2">
              <div class="flex items-center -mx-2">
                <button class="flex flex-1 items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                  <span class="material-symbols-outlined text-base">favorite</span>
                  <span class="text-sm font-medium">Thích</span>
                </button>
                <button class="flex flex-1 items-center justify-center gap-2 h-9 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted-light dark:text-text-muted-dark">
                  <span class="material-symbols-outlined text-base">chat_bubble</span>
                  <span class="text-sm font-medium">Bình luận</span>
                </button>
              </div>
              <div class="flex items-center gap-3">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWNXefvDPSWGCS8iEdkycNYuiZPBfzRHHrbPOhaTYzq-r3j3vGzq1ABRMz4MHupNWy-qvI4aEL_kHMfauXkpKhm_QwsC-e_nww9FMz5X3dZx2mG8fFOS9H2pGeu02fabiWOh2EFxPpN3PNbcwtSFSbRM9swdH-G2obOQhTi5ZdNAKGYM5FChvJ9h2eAHH16BqrozCEGWr_gyEM2ElBNrrGPFJmi47vBRPh5vlu-afQa3BHS2PLAjxw1y8eYdiBmrnZJOnAju6oux4")'}}></div>
                <input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-text-light dark:text-text-dark focus:outline-0 focus:ring-1 focus:ring-primary border border-border-light dark:border-border-dark bg-background-light dark:bg-white/5 h-9 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark px-4 text-sm font-normal leading-normal" placeholder="Viết bình luận..." />
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default FeedPage;
