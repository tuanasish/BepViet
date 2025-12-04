import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChefHatLogo from '../../components/ChefHatLogo';
import { apiRegister, saveAuthToStorage } from '../../api';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (password.length < 3) {
      setError('Mật khẩu phải có ít nhất 3 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const auth = await apiRegister(name, email, password);
      saveAuthToStorage(auth);
      // Sau khi đăng ký thành công, chuyển sang trang feed
      window.location.hash = '#/feed';
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light overflow-x-hidden dark:bg-background-dark items-center justify-center">
      <div class="layout-container flex h-full grow flex-col justify-center">
        <div class="px-4 flex flex-1 justify-center items-center py-10 sm:py-12 md:py-16">
          <div class="layout-content-container flex flex-col w-full max-w-md">
            <div class="flex flex-col items-center gap-8 w-full">
              <div class="flex flex-col items-center justify-center">
                <ChefHatLogo className="h-10 w-auto mb-1" />
                <p class="font-bold text-lg text-text-light dark:text-text-dark mt-1">BepViet</p>
              </div>
              {error && (
                <div class="w-full">
                  <p class="rounded-lg bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
              <div class="flex w-full flex-col items-stretch gap-8 bg-white dark:bg-card-dark p-6 sm:p-8 rounded-xl border border-border-light dark:border-border-dark">
                <div class="flex flex-col items-center gap-2">
                  <p class="text-text-light dark:text-text-dark text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Đăng ký</p>
                </div>
                <form class="flex flex-col items-stretch gap-4" onSubmit={handleRegister}>
                  <label class="flex flex-col w-full">
                    <p class="text-text-light dark:text-text-dark/90 text-base font-medium leading-normal pb-2">Tên hiển thị</p>
                    <input
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-white dark:bg-background-dark h-14 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark p-[15px] text-base font-normal leading-normal"
                      placeholder="Nhập tên hiển thị của bạn"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                  <label class="flex flex-col w-full">
                    <p class="text-text-light dark:text-text-dark/90 text-base font-medium leading-normal pb-2">Email</p>
                    <input
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark bg-white dark:bg-background-dark h-14 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark p-[15px] text-base font-normal leading-normal"
                      placeholder="Nhập địa chỉ email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label class="flex flex-col w-full">
                    <p class="text-text-light dark:text-text-dark/90 text-base font-medium leading-normal pb-2">Mật khẩu</p>
                    <div class="flex w-full flex-1 items-stretch">
                      <input
                        class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-r-0 border-border-light dark:border-border-dark bg-white dark:bg-background-dark h-14 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark p-[15px] pr-2 text-base font-normal leading-normal"
                        placeholder="Nhập mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button aria-label="Toggle password visibility" class="text-text-muted-light dark:text-text-dark/60 flex border border-l-0 border-border-light dark:border-border-dark bg-white dark:bg-background-dark items-center justify-center px-4 rounded-r-lg hover:bg-gray-50 dark:hover:bg-white/5">
                        <span class="material-symbols-outlined">visibility_off</span>
                      </button>
                    </div>
                    <p class="text-sm text-text-muted-light dark:text-text-dark/50 pt-2">Sử dụng ít nhất 8 ký tự.</p>
                  </label>
                  <label class="flex flex-col w-full">
                    <p class="text-text-light dark:text-text-dark/90 text-base font-medium leading-normal pb-2">Nhập lại mật khẩu</p>
                    <div class="flex w-full flex-1 items-stretch">
                      <input
                        class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-r-0 border-border-light dark:border-border-dark bg-white dark:bg-background-dark h-14 placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark p-[15px] pr-2 text-base font-normal leading-normal"
                        placeholder="Nhập lại mật khẩu"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button aria-label="Toggle password visibility" class="text-text-muted-light dark:text-text-dark/60 flex border border-l-0 border-border-light dark:border-border-dark bg-white dark:bg-background-dark items-center justify-center px-4 rounded-r-lg hover:bg-gray-50 dark:hover:bg-white/5">
                        <span class="material-symbols-outlined">visibility_off</span>
                      </button>
                    </div>
                  </label>
                  <button
                    class="flex items-center justify-center font-bold text-white h-14 w-full rounded-lg text-base leading-6 bg-primary hover:bg-primary/90 transition-colors duration-200 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                  </button>
                  <div class="flex justify-center">
                    <Link class="text-text-light dark:text-text-dark/90 text-base font-medium leading-normal hover:text-primary dark:hover:text-primary" to="/">Đã có tài khoản? Đăng nhập</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


