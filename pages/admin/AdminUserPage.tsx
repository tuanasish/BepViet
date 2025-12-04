import React from 'react';
import AdminSideBar from '../../components/AdminSideBar';

const AdminUserPage: React.FC = () => {
    const users = [
        { id: 1, name: 'An Nguyen', email: 'an.nguyen@email.com', role: 'Admin', roleColor: 'blue', date: '25/10/2023', status: 'Hoạt động', statusColor: 'green', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoU9kYBldt8k6qVyohzia25a93Z82pzjiUiZxHrkqQ_z0UNj500q8kMSH3FA0VG5b0cC17eDUrIs6Vg-OuofnS3ns9pw4IDOCUt2FnehWkUsvAROU34NFygCQfpj61pHh0sG6a42G8IMfFkRRbQ6bex4x8qwGLYM7A5f1ZgSDnGlc9JFg2WVIJxpZXHVqDoTysnjx9YNowbK7fmHqWR6uQZ4IGgdjcdyvzZqCv5SSQqdWl0Z6HgEW_loJRCNXJvMGBVVUz1VQCuNw' },
        { id: 2, name: 'Binh Tran', email: 'binh.tran@email.com', role: 'User', roleColor: 'gray', date: '24/10/2023', status: 'Hoạt động', statusColor: 'green', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChyDsswWFeFC1cmxUqlYZ5SNTWIqAc6OrDMkZhtAdxTi6kX9pPon76kbczsveM5xgzaS_hxa9nFwKZPESihFOZA-HlM69bpIs2qZwE_fx6ZYaD-t5-zo9xJi_7pGqINTN_Wn0f_MDu6pEdEsgcAccODgYTa_wfIvp1jpsRXwsok4iC-TFqZIxgNvyNs2A92YPtg7xA-RkwEuT7iU21x8l4kiNNMXfmJiHT7VWS3oapU43QAcrhdEnI6-Jzeq4RssBq4sOSN1cMexA' },
        { id: 3, name: 'Cam Le', email: 'cam.le@email.com', role: 'User', roleColor: 'gray', date: '23/10/2023', status: 'Bị khóa', statusColor: 'red', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5SkBxuZRacyLzcBAo_40aIBL3haiy0WyKPGxu-q1mvgadse5QEFrcGZeRxqi_vEzZlbGhmD7Boa7XyrJtPFVVp70oDidFXC1v5r_pb9MQ1qFGB0q845zJ5GT5_riap5FCKonWbfO8C_WZJaA9iv8cadLCW4hs8L2kBXNrATSZW8pRmkfIP5oglAofyIrhDkm8Dg58Mwepl7TPS21knn-IB5zUY-KpQ9htwvif9skkpXvM4lJjOQJce6fm_WTJIAEvNY1j_7xHQdU' },
        { id: 4, name: 'Dung Pham', email: 'dung.pham@email.com', role: 'User', roleColor: 'gray', date: '22/10/2023', status: 'Hoạt động', statusColor: 'green', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZIDEVXuIWOJ0MLFiZdusDP_g6jOqoX1csij6YqKTodtNngMiW5TS_W5-e1P-m0vqU0K51U41DDRu7uDyMR2HBTDwgQ4j7kystXKtLHqyvfyaAfxf7tjJh-4L0jDNcw5keDAZSrJoQrr82r3zg0S8AEN4iq3NdyYuZR7wY6AEKIjtglcwcXe4gAfYFfn5VoYmYRFRsYfpUJ1jpLTRFXnhD-GT1ymQtevkL7JzlEzWarwENb9BGyKJKY3NWX8N18Nqg0-cNhB26pI8' }
    ];

  return (
    <div class="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main class="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
          {/* PageHeading */}
          <div class="flex flex-wrap justify-between items-center gap-4">
            <div class="flex flex-col gap-1">
              <p class="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-tight">Quản lý Người dùng</p>
              <p class="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">Xem, tìm kiếm, và quản lý tất cả người dùng trên nền tảng.</p>
            </div>
            <button class="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:opacity-90">
              <span class="material-symbols-outlined">add</span>
              <span class="truncate">Thêm người dùng mới</span>
            </button>
          </div>
          {/* SearchBar and Filters */}
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <label class="flex flex-col min-w-40 h-12 w-full">
                <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div class="text-text-muted-light dark:text-text-muted-dark flex bg-white dark:bg-card-dark items-center justify-center pl-4 rounded-l-lg border border-border-light dark:border-border-dark border-r-0">
                    <span class="material-symbols-outlined">search</span>
                  </div>
                  <input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark dark:placeholder:text-text-muted-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-white dark:bg-card-dark h-full placeholder:text-text-muted-light px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" placeholder="Tìm kiếm theo tên hoặc email..." />
                </div>
              </label>
            </div>
            <div class="flex items-center gap-3">
              <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark dark:text-text-dark dark:hover:bg-white/10 border border-border-light dark:border-border-dark px-4 shadow-sm">
                <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal">Vai trò</p>
                <span class="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark">expand_more</span>
              </button>
              <button class="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-card-dark dark:text-text-dark dark:hover:bg-white/10 border border-border-light dark:border-border-dark px-4 shadow-sm">
                <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal">Trạng thái</p>
                <span class="material-symbols-outlined text-text-muted-light dark:text-text-muted-dark">expand_more</span>
              </button>
            </div>
          </div>
          {/* Table */}
          <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
              <div class="overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-sm">
                <table class="min-w-full divide-y divide-border-light dark:divide-border-dark">
                  <thead class="bg-gray-50 dark:bg-white/5">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-1/12" scope="col">Người dùng</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-3/12" scope="col">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12" scope="col">Vai trò</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12" scope="col">Ngày tạo</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12" scope="col">Trạng thái</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider w-2/12" scope="col">Hành động</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-card-dark divide-y divide-border-light dark:divide-border-dark">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: `url("${user.avatar}")`}}></div>
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-text-light dark:text-text-dark">{user.name}</div>
                                </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">{user.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.roleColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">{user.date}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.statusColor === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex items-center gap-2">
                                <button class="text-text-muted-light hover:text-primary dark:text-text-muted-dark dark:hover:text-primary"><span class="material-symbols-outlined">admin_panel_settings</span></button>
                                {user.status === 'Bị khóa' ? (
                                    <button class="text-text-muted-light hover:text-green-600 dark:text-text-muted-dark dark:hover:text-green-500"><span class="material-symbols-outlined">lock_open</span></button>
                                ) : (
                                    <button class="text-text-muted-light hover:text-red-600 dark:text-text-muted-dark dark:hover:text-red-500"><span class="material-symbols-outlined">lock</span></button>
                                )}
                                </div>
                            </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserPage;
