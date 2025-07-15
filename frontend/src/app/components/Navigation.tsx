'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  email: string;
  avatar?: string;
  name?: string;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          email: payload.email,
          avatar: userAvatar || payload.avatar,
          name: userName || payload.name,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    setUser(null);
    router.replace('/login');
  };

  if (loading) {
    return (
      <nav className="w-full bg-gradient-to-r from-purple-900 to-blue-900 shadow-lg px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-white">SementesPLAY</div>
          <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </nav>
    );
  }

  if (user) {
    return (
      <nav className="w-full bg-gradient-to-r from-purple-900 to-blue-900 shadow-lg px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-white">SementesPLAY</div>
          <div className="flex items-center gap-4">
            {user.avatar && (
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
            )}
            <span className="text-white font-semibold">{user.name || user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold ml-2"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-gradient-to-r from-purple-900 to-blue-900 shadow-lg px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-200 transition">
          SementesPLAY
        </Link>

        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-white hover:text-blue-200 transition font-medium">
            Dashboard
          </Link>
          <Link href="/estatisticas" className="text-white hover:text-blue-200 transition font-medium">
            Estatísticas
          </Link>
          <Link href="/rankings" className="text-white hover:text-blue-200 transition font-medium">
            Rankings
          </Link>
          <Link href="/conquistas" className="text-white hover:text-blue-200 transition font-medium">
            Conquistas
          </Link>
          <Link href="/favoritos" className="text-white hover:text-blue-200 transition font-medium">
            Favoritos
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                )}
                <span className="text-white font-medium text-sm">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 