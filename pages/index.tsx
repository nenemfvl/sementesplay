import React from 'react'
import Head from 'next/head'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  HeartIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  PlayIcon,
  StarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { auth } from '../lib/auth';

export default function Home() {
  const [activeTab, setActiveTab] = useState('como-funciona')
  const user = typeof window !== 'undefined' ? auth.getUser() : null;

  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'Cashback de 10%',
      description: 'Receba Sementes equivalentes a 10% de todas as suas compras em cidades FiveM parceiras.'
    },
    {
      icon: HeartIcon,
      title: 'Doações para Criadores',
      description: 'Doe suas Sementes para seus criadores de conteúdo favoritos e ajude-os a crescer.'
    },
    {
      icon: UserGroupIcon,
      title: 'Comunidade Ativa',
      description: 'Faça parte de uma comunidade vibrante de jogadores e criadores de conteúdo.'
    },
    {
      icon: ChartBarIcon,
      title: 'Sistema de Ranking',
      description: 'Criadores são ranqueados por engajamento e recebem benefícios especiais.'
    }
  ]

  const niveis = [
    {
      nome: 'Supremo',
      cor: 'purple',
      requisitos: 'Top 100 criadores',
      beneficios: ['Destaque na plataforma', 'Recompensas especiais', 'Missões exclusivas']
    },
    {
      nome: 'Parceiro',
      cor: 'blue',
      requisitos: 'Top 101-300 criadores',
      beneficios: ['Destaque na plataforma', 'Recompensas médias', 'Missões especiais']
    },
    {
      nome: 'Comum',
      cor: 'gray',
      requisitos: 'Demais criadores',
      beneficios: ['Recompensas básicas', 'Missões comuns']
    }
  ]

  return (
    <>
      <Head>
        <title>SementesPLAY - Sistema de Cashback e Doações</title>
        <meta name="description" content="Sistema de cashback e doações para o ecossistema FiveM. Receba 10% de cashback em compras e doe para criadores de conteúdo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light sticky top-0 z-50 relative">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-6">
              <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
                <a href="/" className="text-sss-white hover:text-sss-accent">Início</a>
                <a href="/status" className="text-sss-white hover:text-sss-accent">Status</a>
                <a href="/salao" className="text-sss-white hover:text-sss-accent">Salão</a>
                <a href="/criadores" className="text-sss-white hover:text-sss-accent">Criadores</a>
                <a href="/parceiros" className="text-sss-white hover:text-sss-accent">Parceiros</a>
                <a href="/dashboard" className="text-sss-white hover:text-sss-accent">Dashboard</a>
              </nav>
            </div>
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

        {/* Hero Section */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-sss-white mb-6">
                  Sistema de{' '}
                  <span className="text-gradient">Cashback</span>
                  <br />
                  e <span className="text-gradient">Doações</span>
                </h1>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Receba 10% de cashback em todas as suas compras em cidades FiveM parceiras 
                  e doe para seus criadores de conteúdo favoritos.
                </p>
              </motion.div>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <a href="/registro" className="btn-primary text-lg px-8 py-3">
                  Começar Agora
                </a>
                <a href="#como-funciona" className="btn-outline text-lg px-8 py-3">
                  Saiba Mais
                </a>
              </motion.div>
            </div>
          </div>
        </section>

                 {/* Features Section */}
         <section id="como-funciona" className="py-20 bg-sss-medium">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-sss-white mb-4">
                 Como Funciona
               </h2>
               <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                O SementesPLAY é um sistema cíclico que conecta jogadores, criadores de conteúdo e donos de cidades FiveM.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="card text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                                     <div className="w-12 h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                     <feature.icon className="w-6 h-6 text-sss-accent" />
                   </div>
                   <h3 className="text-lg font-semibold text-sss-white mb-2">
                     {feature.title}
                   </h3>
                   <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

                 {/* Níveis Section */}
         <section id="niveis" className="py-20 bg-sss-dark">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-sss-white mb-4">
                 Níveis de Criadores
               </h2>
               <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Criadores são ranqueados por engajamento e recebem benefícios especiais baseados em seu nível.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {niveis.map((nivel, index) => (
                <motion.div
                  key={nivel.nome}
                  className="card text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className={`w-16 h-16 bg-${nivel.cor}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <StarIcon className={`w-8 h-8 text-${nivel.cor}-600`} />
                  </div>
                  <h3 className={`text-xl font-bold text-${nivel.cor}-600 mb-2`}>
                    {nivel.nome}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {nivel.requisitos}
                  </p>
                  <ul className="text-left space-y-2">
                    {nivel.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 bg-${nivel.cor}-400 rounded-full mr-2`}></div>
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

                 {/* CTA Section */}
         <section className="py-20 bg-gradient-to-r from-sss-accent to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se à comunidade SementesPLAY e comece a receber cashback 
              enquanto apoia seus criadores favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/registro" className="bg-white text-sss-accent font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                Criar Conta Grátis
              </a>
              <a href="/login" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-sss-accent transition-colors">
                Já tenho conta
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <a href="/ranking" className="text-white/80 hover:text-white text-sm">
                Ranking de Criadores
              </a>
              <a href="/buscar" className="text-white/80 hover:text-white text-sm">
                Buscar Criadores
              </a>
              <a href="/termos" className="text-white/80 hover:text-white text-sm">
                Termos de Uso
              </a>
              <a href="/ajuda" className="text-white/80 hover:text-white text-sm">
                Ajuda
              </a>
            </div>
          </div>
        </section>

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
              <a href="#" title="Discord" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.405-.874-.617-1.249a.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.369a.064.064 0 0 0-.03.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 0 0 .031.056c2.052 1.507 4.042 2.422 5.992 3.029a.077.077 0 0 0 .084-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.104c-.652-.247-1.27-.549-1.872-.892a.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.298 12.298 0 0 1-1.873.891.076.076 0 0 0-.04.105c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028c1.961-.607 3.951-1.522 6.003-3.029a.077.077 0 0 0 .031-.055c.5-5.177-.838-9.637-3.548-13.625a.061.061 0 0 0-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
              </a>
              <a href="#" title="Instagram" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.741 2 6.151 2 12c0 5.849.013 6.259.072 7.54.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.281.072-1.691.072-7.54 0-5.849-.013-6.259-.072-7.54-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
              <a href="#" title="TikTok" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V7.5a5.25 5.25 0 0 0 5.25 5.25V9.75A3.75 3.75 0 0 1 16.5 6V2h-3.75z"/></svg>
              </a>
              <a href="#" title="YouTube" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="#" title="Twitter" className="text-gray-400 hover:text-sss-accent" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.813 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              </a>
            </div>
            {/* Links horizontais */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-gray-400 text-sm">
              <a href="/termos" className="hover:text-sss-accent">Termos de Uso</a>
              <span>|</span>
              <a href="/privacidade" className="hover:text-sss-accent">Política de Privacidade</a>
              <span>|</span>
              <a href="/ajuda" className="hover:text-sss-accent">Ajuda</a>
              <span>|</span>
              <a href="/ranking" className="hover:text-sss-accent">Ranking de Criadores</a>
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