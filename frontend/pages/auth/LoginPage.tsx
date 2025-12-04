import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChefHatLogo from '../../components/ChefHatLogo';
import { apiLogin, saveAuthToStorage } from '../../api';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
          const auth = await apiLogin(email, password);
          saveAuthToStorage(auth);
          navigate('/feed');
        } catch (err: any) {
          setError(err.message || 'Đăng nhập thất bại');
        } finally {
          setLoading(false);
        }
    };

  return (
    <div class="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-background-light p-4 dark:bg-background-dark">
      <div class="layout-container flex h-full w-full grow flex-col items-center justify-center">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-sm dark:bg-card-dark sm:p-8">
          <div class="flex flex-col items-center justify-center">
            <ChefHatLogo className="mb-3 h-12 w-auto text-primary" />
            <h1 class="text-2xl font-bold text-text-light dark:text-text-dark sm:text-3xl">Đăng nhập</h1>
          </div>
          {error && (
            <div class="my-4">
              <p class="rounded-lg bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </p>
            </div>
          )}
          <form class="flex flex-col gap-4" onSubmit={handleLogin}>
            <div class="flex flex-col">
              <label class="mb-2 text-base font-medium text-text-light dark:text-text-dark" htmlFor="email">Email</label>
              <input
                class="form-input h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-border-light bg-white p-3 text-base font-normal text-text-light placeholder:text-text-muted-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-text-muted-dark"
                id="email"
                placeholder="Nhập email của bạn"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div class="flex flex-col">
              <label class="mb-2 text-base font-medium text-text-light dark:text-text-dark" htmlFor="password">Mật khẩu</label>
              <div class="relative flex w-full flex-1 items-stretch">
                <input
                  class="form-input h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-border-light bg-white p-3 text-base font-normal text-text-light placeholder:text-text-muted-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-text-muted-dark"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted-light dark:text-text-muted-dark" type="button">
                  <span class="material-symbols-outlined">visibility_off</span>
                </button>
              </div>
            </div>
            <div class="flex items-center">
              <input class="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700" id="remember-me" type="checkbox" />
              <label class="ml-2 block text-sm text-text-light dark:text-text-dark" htmlFor="remember-me">Ghi nhớ tôi</label>
            </div>
            <button
              class="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-base font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <div class="mt-6 text-center">
            <p class="text-sm text-text-light dark:text-text-dark">
              Chưa có tài khoản?
              <Link class="font-medium text-primary hover:underline ml-1" to="/register">Đăng ký</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


