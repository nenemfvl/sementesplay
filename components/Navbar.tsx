import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { auth, User } from '../lib/auth';

export default function Navbar() {
  const router = useRouter();
  console.log('Navbar asPath:', router.asPath);
  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setUser(auth.getUser());
    }
  }, []);

  return (
    <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
      {/* Logo e nome colados à esquerda como botão para o topo */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Ir para o topo"
      >
        <span className="text-2xl text-sss-accent">🌱</span>
        <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
      </button>
      {/* Debug visual do asPath centralizado no topo da tela */}
      <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', background: 'yellow', color: 'black', fontSize: 16, zIndex: 99999, textAlign: 'center', padding: 4}}>
        asPath: {router.asPath}
      </div>
      <div className="flex justify-center items-center py-6">
        <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
          <a href="/" className={`${router.asPath === '/' ? 'text-sss-accent font-bold border-b-2 border-sss-accent' : 'text-sss-white hover:text-sss-accent'}`}>Início</a>
          <a href="/status" className={`${router.asPath.startsWith('/status') ? 'text-sss-accent font-bold border-b-2 border-sss-accent' : 'text-sss-white hover:text-sss-accent'}`}>Status</a>
          <a href="/salao" className={`${router.asPath.startsWith('/salao') ? 'text-sss-accent font-bold border-b-2 border-sss-accent' : 'text-sss-white hover:text-sss-accent'}`}>Salão</a>
          <a href="/criadores" className={`${router.asPath.startsWith('/criadores') || router.asPath.startsWith('/criador') ? 'text-sss-accent font-bold border-b-2 border-sss-accent' : 'text-sss-white hover:text-sss-accent'}`}>Criadores</a>
          <a href="/parceiros" className={`${router.asPath.startsWith('/parceiros') ? 'text-sss-accent font-bold border-b-2 border-sss-accent' : 'text-sss-white hover:text-sss-accent'}`}>Parceiros</a>
          <a href="/dashboard" className={`${router.asPath.startsWith('/dashboard') ? 'text-sss-accent font-bold border-b-2 border-sss-accent' : 'text-sss-white hover:text-sss-accent'}`}>Dashboard</a>
        </nav>
      </div>
      {/* Usuário e logout colados na borda direita */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4 px-6">
        {user ? (
          <>
            <span className="text-sss-accent font-bold">{user.nome}</span>
            <button onClick={() => { auth.logout(); window.location.reload(); }} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="btn-outline">Entrar</a>
            <a href="/registro" className="btn-primary">Cadastrar</a>
          </>
        )}
      </div>
    </header>
  );
} 