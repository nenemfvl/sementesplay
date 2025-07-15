'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { auth } from '../../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token } = await login(email, password);
      localStorage.setItem('token', token);
      showToast('Login realizado com sucesso!', 'success');
      router.replace('/dashboard');
    } catch (error) {
      showToast('Email ou senha incorretos', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
            <p className="text-gray-300">Entre na sua conta SementesPLAY</p>
          </div>

          <button
            onClick={async () => {
              const provider = new GoogleAuthProvider();
              setLoading(true);
              try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                const idToken = await user.getIdToken();
                // Enviar idToken para o backend
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/google' || 'http://localhost:3001/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken }),
                });
                if (!response.ok) throw new Error('Erro ao autenticar com backend');
                const data = await response.json();
                localStorage.setItem('token', data.token);
                // Salvar nome e avatar do usuário Google
                localStorage.setItem('userName', user.displayName || '');
                localStorage.setItem('userAvatar', user.photoURL || '');
                showToast('Login com Google realizado com sucesso!', 'success');
                setTimeout(() => {
                  router.replace('/');
                  window.location.href = '/'; // Força redirecionamento para home
                }, 500);
              } catch (error) {
                showToast('Erro ao fazer login com Google', 'error');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3 px-4 mb-4 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Entrar com Google
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="text-blue-400 hover:text-blue-300 font-medium transition">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}