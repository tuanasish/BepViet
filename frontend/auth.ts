export function getStoredUser():
  | {
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
      avatarUrl?: string;
    }
  | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('bepviet_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getStoredUser();
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === 'admin';
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bepviet_token');
  localStorage.removeItem('bepviet_user');
}


