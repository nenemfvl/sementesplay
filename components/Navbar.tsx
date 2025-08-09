import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  UserGroupIcon, 
  ChevronDownIcon, 
  ArrowLeftOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { auth, User } from '../lib/auth'
import { useNavigation } from '../hooks/useNavigation'
import FriendsChat from './FriendsChat'

interface UserWithCriador extends User {
  criador?: {
    id: string;
    nome: string;
    bio: string;
    categoria: string;
    nivel: string;
    sementes: number;
    apoiadores: number;
    doacoes: any[];
    redesSociais: any;
    portfolio: any;
    dataCriacao: string;
  };
}

export default function Navbar() {
  const router = useRouter();
  const { navigateTo } = useNavigation();
  const [user, setUser] = React.useState<UserWithCriador | null>(null);
  const [showSocials, setShowSocials] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showFriendsChat, setShowFriendsChat] = React.useState(false);

  React.useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        const currentUser = auth.getUser();
        if (currentUser) {
          setUser(currentUser as UserWithCriador);
        }
      }
    };

    loadUserData();
  }, []);

  // Fechar dropdowns quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu') && !target.closest('.socials-menu')) {
        setShowProfileMenu(false);
        setShowSocials(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowSocials(false); // Fechar outros dropdowns
  };

  const handleMenuItemClick = (path: string) => {
    if (path === '/amigos') {
      setShowFriendsChat(true);
      setShowProfileMenu(false);
    } else {
      navigateTo(path);
      setShowProfileMenu(false);
    }
  };

  return (
    <>
    <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
      {/* Logo e nome colados à esquerda como botão para o topo */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none bg-transparent border-none cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Ir para o topo"
      >
        <span className="text-2xl text-sss-accent">🌱</span>
        <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
      </button>
      {/* Remover o bloco de debug visual do asPath */}
      <div className="flex justify-center items-center py-6">
        <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
          <Link href="/" className={`${router.asPath === '/' ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Início</Link>
          <Link href="/status" className={`${router.asPath.startsWith('/status') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Status</Link>
          <Link href="/salao" className={`${router.asPath.startsWith('/salao') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'} relative flex items-center gap-2`}>
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
            Salão
          </Link>

          <Link href="/parceiros" className={`${router.asPath.startsWith('/parceiros') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Parceiros</Link>
          {(user?.nivel === 'criador-iniciante' || user?.nivel === 'criador-comum' || user?.nivel === 'criador-parceiro' || user?.nivel === 'criador-supremo') && (
            <Link href="/painel-criador" className={`${router.asPath.startsWith('/painel-criador') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Painel Criador</Link>
          )}
          
          {(user?.nivel === 'parceiro' || user?.tipo === 'parceiro') && (
            <Link href="/painel-parceiro" className={`${router.asPath.startsWith('/painel-parceiro') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Painel Parceiro</Link>
          )}
          
          {Number(user?.nivel) >= 5 && (
            <Link href="/admin" className={`${router.asPath.startsWith('/admin') ? 'text-sss-accent font-bold' : 'text-sss-white hover:text-sss-accent'}`}>Painel Admin</Link>
          )}
        </nav>
      </div>
      {/* Usuário e logout colados na borda direita */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4 px-6">
        {user ? (
          <>
            {/* Menu dropdown do perfil */}
            <div className="relative profile-menu">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
              >
                {/* Avatar do usuário */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-sss-accent flex items-center justify-center">
                  {user.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt={`Avatar de ${user.nome}`}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        // Fallback para ícone se a imagem falhar
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling;
                        if (nextElement) {
                          nextElement.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <UserIcon className={`w-5 h-5 text-white ${user.avatarUrl ? 'hidden' : ''}`} />
                </div>
                <span className="text-sss-accent font-bold">{user.nome}</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-300 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuItemClick('/perfil')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      👤 Perfil
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/doar')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      💝 Fazer Doação
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/cashback')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      💰 Cashback
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/carteira')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      🏦 Carteira
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/amigos')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      👥 Amigos
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/notificacoes')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      🔔 Notificações
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/criadores-favoritos')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      ⭐ Criadores Favoritos
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/parceiros-favoritos')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      🏢 Parceiros Favoritos
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('/suporte')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sss-accent"
                    >
                      💬 Suporte
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Dropdown de redes sociais */}
            <div className="relative inline-block text-left socials-menu">
              <button
                onClick={() => setShowSocials((v) => !v)}
                className="p-2 text-gray-300 hover:text-sss-accent focus:outline-none"
                title="Redes sociais"
              >
                <UserGroupIcon className="w-6 h-6" />
              </button>
              {showSocials && (
                <div className="origin-top-right absolute right-0 mt-2 w-16 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50 flex flex-col items-center py-2 gap-2">
                  <a href="https://discord.gg/7vtVZYvR" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent" title="Discord" aria-label="Discord"><i className="fab fa-discord fa-lg"></i></a>
                  <a href="https://www.instagram.com/sementesplay/" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent" title="Instagram" aria-label="Instagram"><i className="fab fa-instagram fa-lg"></i></a>
                  <a href="https://www.tiktok.com/@sementesplay" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent" title="TikTok" aria-label="TikTok"><i className="fab fa-tiktok fa-lg"></i></a>
                  <a href="https://www.youtube.com/@SementesPLAY" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent" title="YouTube" aria-label="YouTube"><i className="fab fa-youtube fa-lg"></i></a>
                  <a href="https://x.com/SementesPLAY" target="_blank" rel="noopener noreferrer" className="hover:text-sss-accent" title="Twitter" aria-label="Twitter"><i className="fab fa-twitter fa-lg"></i></a>
                </div>
              )}
            </div>
            <button onClick={async () => { await auth.logout(); window.location.reload(); }} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-outline">Entrar</Link>
            <Link href="/registro" className="btn-primary">Cadastrar</Link>
          </>
        )}
      </div>
    </header>
    
    {/* Chat flutuante de amigos */}
    {showFriendsChat && <FriendsChat />}
  </>
  )
} 