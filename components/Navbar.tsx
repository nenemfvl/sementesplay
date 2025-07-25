import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftOnRectangleIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { auth, User } from '../lib/auth';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const router = useRouter();
  console.log('Navbar asPath:', router.asPath);
  const [user, setUser] = React.useState<User | null>(null);
  const [showSocials, setShowSocials] = React.useState(false);

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
      {/* Remover o bloco de debug visual do asPath */}
      <div className="flex justify-center items-center py-6">
        <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
          <a href="/" className={`${router.asPath === '/' ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Início</a>
          <a href="/status" className={`${router.asPath.startsWith('/status') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Status</a>
          <a href="/salao" className={`${router.asPath.startsWith('/salao') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'} relative flex items-center gap-2`}>
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
            Salão
          </a>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              const user = auth.getUser();
              if (!user) {
                window.location.href = '/login';
                return;
              }
              window.location.href = '/buscar';
            }}
            className={`${router.asPath.startsWith('/buscar') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}
          >
            Buscar Criadores
          </a>
          <a href="/parceiros" className={`${router.asPath.startsWith('/parceiros') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Parceiros</a>
          <a href="/dashboard" className={`${router.asPath.startsWith('/dashboard') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Dashboard</a>
        </nav>
      </div>
      {/* Usuário e logout colados na borda direita */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4 px-6">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              {/* Avatar do usuário */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-sss-accent flex items-center justify-center">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={`Avatar de ${user.nome}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para ícone se a imagem falhar
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <UserIcon className={`w-5 h-5 text-white ${user.avatarUrl ? 'hidden' : ''}`} />
              </div>
              <span className="text-sss-accent font-bold">{user.nome}</span>
            </div>
            {/* Dropdown de redes sociais */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowSocials((v) => !v)}
                className="p-2 text-gray-300 hover:text-sss-accent focus:outline-none"
                title="Redes sociais"
              >
                <UserGroupIcon className="w-6 h-6" />
              </button>
              {showSocials && (
                <div className="origin-top-right absolute right-0 mt-2 w-16 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50 flex flex-col items-center py-2 gap-2">
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent"><i className="fab fa-discord fa-lg"></i></a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent"><i className="fab fa-instagram fa-lg"></i></a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent"><i className="fab fa-tiktok fa-lg"></i></a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent"><i className="fab fa-youtube fa-lg"></i></a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent"><i className="fab fa-twitter fa-lg"></i></a>
                </div>
              )}
            </div>
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