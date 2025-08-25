import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FaTwitch, FaYoutube, FaTiktok, FaInstagram, FaHeart, FaRegHeart } from 'react-icons/fa'


export default function CriadoresFavoritos() {
  const [criadores, setCriadores] = useState<any[]>([])
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Carregar favoritos do localStorage
    const favoritosSalvos = localStorage.getItem('criadoresFavoritos')
    if (favoritosSalvos) {
      setFavoritos(new Set(JSON.parse(favoritosSalvos)))
    }

         // Carregar todos os criadores
     fetch('/api/ranking/criadores')
       .then(res => res.json())
               .then(data => {
          setCriadores(data.criadores || [])
          setLoading(false)
        })
      .catch(error => {
        console.error('Erro ao carregar criadores:', error)
        setLoading(false)
      })
  }, [])

  // Filtrar apenas criadores favoritados
  const criadoresFavoritos = criadores.filter(criador => favoritos.has(criador.id))

  const toggleFavorito = (criadorId: string) => {
    const novosFavoritos = new Set(favoritos)
    if (novosFavoritos.has(criadorId)) {
      novosFavoritos.delete(criadorId)
    } else {
      novosFavoritos.add(criadorId)
    }
    setFavoritos(novosFavoritos)
    
    // Salvar no localStorage
    localStorage.setItem('criadoresFavoritos', JSON.stringify(Array.from(novosFavoritos)))
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Criadores Favoritos - SementesPLAY</title>
        </Head>
        <div className="min-h-screen bg-sss-dark flex flex-col">

          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Carregando criadores favoritos...</div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Criadores Favoritos - SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col">
        {/* Header */}
        <header className="bg-black shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none bg-transparent border-none cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir para o topo"
            title="Ir para o topo"
          >
            <span className="text-2xl text-sss-accent">🌱</span>
            <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
          </button>

        </header>

        <main className="flex-1 flex flex-col items-center py-12 px-2 md:px-0">
          {/* Título da página */}
          <section className="w-full max-w-5xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⭐</span>
              <h1 className="text-3xl font-bold text-sss-white">Criadores Favoritos</h1>
            </div>
            
            {criadoresFavoritos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h2 className="text-xl font-semibold text-gray-400 mb-2">Nenhum criador favoritado</h2>
                <p className="text-gray-500 mb-6">Você ainda não favoritou nenhum criador.</p>
                <button
                  onClick={() => router.push('/status')}
                  className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Ver Todos os Criadores
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-6">
                  Você tem {criadoresFavoritos.length} criador{criadoresFavoritos.length !== 1 ? 'es' : ''} favoritado{criadoresFavoritos.length !== 1 ? 's' : ''}
                </p>

                                 {/* Grid de criadores favoritos */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {criadoresFavoritos.map((criador) => (
                    <div key={criador.id} className="bg-sss-medium rounded-xl p-4 shadow-md">
                      <div className="flex">
                        {/* Conteúdo Principal */}
                        <div className="flex items-center flex-1">
                          <img 
                            src={criador.avatar || '/default-avatar.png'} 
                            alt={criador.nome} 
                            className="w-12 h-12 rounded-full border-2 border-blue-400 mr-3" 
                          />
                          <div className="flex-1">
                            <div className="font-bold text-sss-white">{criador.nome}</div>
                                                         <div className="text-sm text-gray-400">{criador.sementesRecebidas || 0} sementes</div>
                          </div>
                        </div>
                        
                        {/* Botão Favoritar e Redes Sociais - Borda Direita */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => toggleFavorito(criador.id)}
                            className="text-lg hover:scale-110 transition-transform"
                            aria-label="Remover dos favoritos"
                            title="Remover dos favoritos"
                          >
                            <FaHeart className="text-red-500" />
                          </button>
                          
                          {/* Redes Sociais */}
                          {criador.redesSociais && (criador.redesSociais.twitch || criador.redesSociais.youtube || criador.redesSociais.tiktok || criador.redesSociais.instagram || criador.redesSociais.discord) && (
                            <div className="flex flex-row gap-2 mt-4">
                              {criador.redesSociais.twitch && (
                                <a 
                                  href={criador.redesSociais.twitch} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#9147ff] text-lg hover:scale-110 transition-transform"
                                  aria-label="Canal do Twitch"
                                  title="Canal do Twitch"
                                >
                                  <FaTwitch />
                                </a>
                              )}
                              {criador.redesSociais.youtube && (
                                <a 
                                  href={criador.redesSociais.youtube} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#ff0000] text-lg hover:scale-110 transition-transform"
                                  aria-label="Canal do YouTube"
                                  title="Canal do YouTube"
                                >
                                  <FaYoutube />
                                </a>
                              )}
                              {criador.redesSociais.tiktok && (
                                <a 
                                  href={criador.redesSociais.tiktok} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#000] text-lg hover:scale-110 transition-transform"
                                  aria-label="Perfil do TikTok"
                                  title="Perfil do TikTok"
                                >
                                  <FaTiktok />
                                </a>
                              )}
                              {criador.redesSociais.instagram && (
                                <a 
                                  href={criador.redesSociais.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#e1306c] text-lg hover:scale-110 transition-transform"
                                  aria-label="Perfil do Instagram"
                                  title="Perfil do Instagram"
                                >
                                  <FaInstagram />
                                </a>
                              )}
                              {criador.redesSociais.discord && (
                                <a 
                                  href={criador.redesSociais.discord} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-500 text-lg hover:scale-110 transition-transform"
                                  aria-label="Servidor do Discord"
                                  title="Servidor do Discord"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                   ))}
                 </div>

                {/* Botão para ver todos os criadores */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => router.push('/status')}
                    className="bg-sss-accent hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Ver Todos os Criadores
                  </button>
                </div>
              </>
            )}
          </section>
        </main>

        {/* Footer minimalista centralizado */}
        <footer className="bg-black border-t border-sss-light mt-16">
          <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col items-center">
            {/* Logo e nome */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-sss-white">SementesPLAY</span>
            </div>
            {/* Redes sociais */}
            <div className="flex gap-4 mb-4">
              <a href="https://discord.gg/7vtVZYvR" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="https://www.instagram.com/sementesplay/" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a 
                href="https://www.tiktok.com/@sementesplay" 
                title="TikTok" 
                className="text-gray-400 hover:text-sss-accent" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open('https://www.tiktok.com/@sementesplay', '_blank', 'noopener,noreferrer');
                }}
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="https://www.youtube.com/@SementesPLAY" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="https://x.com/SementesPLAY" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            {/* Copyright */}
            <div className="text-gray-500 text-xs text-center">
              &copy; {new Date().getFullYear()} SementesPLAY. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 